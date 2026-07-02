/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

"use client";

import React, { useState, useEffect } from "react";
import { Result, Row, Col, Alert, Button, message, notification } from "antd";
import { CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import {
  fetchProfile,
  patchProfile,
  deleteAccount,
  type DeactivationPayload,
} from "../../lib/auth/api";
import { clearAppJwt } from "../../lib/auth/tokenStore";
import { StudentProfile } from "../../types/profile";
import { useCollegeMatches } from "./matchEngine";

import ProfileInfoCard from "./cards/ProfileInfoCard";
import AcademicInfoCard from "./cards/AcademicInfoCard";
import PreferencesCard from "./cards/PreferencesCard";
import CollegeMatchesSection from "./cards/CollegeMatchesSection";
import SavedCollegesSection from "./cards/SavedCollegesSection";
import CompareListSection from "./cards/CompareListSection";
import DangerZoneCard from "./cards/DangerZoneCard";
import EditProfileModal from "./modals/EditProfileModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import ChangeEmailModal from "./modals/ChangeEmailModal";
import DeactivateAccountModal from "./modals/DeactivateAccountModal";

interface ProfileDashboardProps {
  /**
   * Real authenticated user, used to seed contact info. `createdAt`/`lastLogin`
   * come from the user's DB record (ISO strings) when available.
   */
  authUser?: {
    displayName: string | null;
    email: string | null;
    createdAt?: string | null;
    lastLogin?: string | null;
  } | null;
}

// Format an ISO timestamp from the DB into a friendly date, falling back to the
// provided default when the value is missing or unparseable.
function formatDbDate(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Return `value` unless it is null/undefined, in which case `fallback` is used.
function pick<T>(value: unknown, fallback: T): T {
  return value === undefined || value === null ? fallback : (value as T);
}

interface ProfileAuthUser {
  displayName: string | null;
  email: string | null;
  createdAt?: string | null;
  lastLogin?: string | null;
}

/**
 * A blank profile. Identity (name/email/dates) is seeded from the authenticated
 * user (real backend data), everything else is empty — there is NO mock/sample
 * data. GET /profile then overlays whatever the user has actually entered.
 */
function emptyProfile(authUser?: ProfileAuthUser | null): StudentProfile {
  return {
    fullName: authUser?.displayName ?? "",
    email: authUser?.email ?? "",
    phone: "",
    address: "",
    createdDate: formatDbDate(authUser?.createdAt, ""),
    lastLogin: formatDbDate(authUser?.lastLogin, ""),
    highSchoolName: "",
    graduationYear: null,
    gpa: null,
    satReadingWriting: null,
    satMath: null,
    actScore: null,
    preferredStates: [],
    preferredPrograms: [],
    preferredDegreeLevel: "",
    preferredCollegeType: "",
  };
}

/**
 * True when the user hasn't entered any academic/preference data yet (new
 * signup). Identity fields (name/email/dates) are ignored — they come from
 * signup, not from the user filling out the profile.
 */
function isProfileEmpty(p: StudentProfile): boolean {
  return (
    !p.phone &&
    !p.address &&
    !p.highSchoolName &&
    p.graduationYear == null &&
    p.gpa == null &&
    p.satReadingWriting == null &&
    p.satMath == null &&
    p.actScore == null &&
    p.preferredStates.length === 0 &&
    p.preferredPrograms.length === 0 &&
    !p.preferredDegreeLevel &&
    !p.preferredCollegeType
  );
}

/**
 * Overlay a backend profile response onto the current StudentProfile. The
 * backend is snake_case (display_name/created_at/preferred_states…); we read
 * snake_case first and fall back to camelCase. Anything the response omits or
 * returns null keeps the current (empty) value — never a fabricated default.
 */
function mergeProfile(
  prev: StudentProfile,
  data: Record<string, unknown>,
): StudentProfile {
  return {
    ...prev,
    fullName: pick(
      data.display_name ?? data.full_name ?? data.fullName,
      prev.fullName,
    ),
    email: pick(data.email, prev.email),
    phone: pick(data.phone, prev.phone),
    address: pick(data.address, prev.address),
    createdDate: data.created_at
      ? formatDbDate(data.created_at as string, prev.createdDate)
      : prev.createdDate,
    lastLogin: data.last_login
      ? formatDbDate(data.last_login as string, prev.lastLogin)
      : prev.lastLogin,
    highSchoolName: pick(
      data.high_school_name ?? data.highSchoolName,
      prev.highSchoolName,
    ),
    graduationYear: pick(
      data.graduation_year ?? data.graduationYear,
      prev.graduationYear,
    ),
    gpa: pick(data.gpa, prev.gpa),
    satReadingWriting: pick(
      data.sat_reading_writing ?? data.satReadingWriting,
      prev.satReadingWriting,
    ),
    satMath: pick(data.sat_math ?? data.satMath, prev.satMath),
    actScore: pick(data.act_score ?? data.actScore, prev.actScore),
    preferredStates: pick(
      data.preferred_states ?? data.preferredStates,
      prev.preferredStates,
    ),
    preferredPrograms: pick(
      data.preferred_programs ?? data.preferredPrograms,
      prev.preferredPrograms,
    ),
    preferredDegreeLevel: pick(
      data.preferred_degree_level ?? data.preferredDegreeLevel,
      prev.preferredDegreeLevel,
    ),
    preferredCollegeType: pick(
      data.preferred_college_type ?? data.preferredCollegeType,
      prev.preferredCollegeType,
    ),
  };
}

// Order-insensitive comparison of two string arrays (used for the multi-value
// preference fields, where selection order carries no meaning).
function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

/**
 * Build the PATCH /profile body from the edit form. The API allowlists
 * *camelCase* keys and silently drops anything else — including the snake_case
 * names GET /profile returns — so the keys here must match its contract
 * exactly (`satMath`, `highSchoolName`, `preferredStates`…). We only include
 * fields the user actually changed (vs. `prev`); omitting a key means "not
 * provided". Email is never sent (Firebase-managed). `preferredStates` is
 * normalized to uppercase 2-letter codes, and the full intended array is sent
 * for the multi-value fields since the API replaces the whole set.
 */
function toProfilePatch(
  prev: StudentProfile,
  values: Omit<StudentProfile, "createdDate" | "lastLogin">,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  const setIfChanged = (key: string, next: unknown, before: unknown) => {
    if (next !== before) patch[key] = next;
  };

  setIfChanged("fullName", values.fullName, prev.fullName);
  setIfChanged("phone", values.phone, prev.phone);
  setIfChanged("address", values.address, prev.address);
  setIfChanged("highSchoolName", values.highSchoolName, prev.highSchoolName);
  setIfChanged("graduationYear", values.graduationYear, prev.graduationYear);
  setIfChanged("gpa", values.gpa, prev.gpa);
  setIfChanged(
    "satReadingWriting",
    values.satReadingWriting,
    prev.satReadingWriting,
  );
  setIfChanged("satMath", values.satMath, prev.satMath);
  setIfChanged("actScore", values.actScore, prev.actScore);
  setIfChanged(
    "preferredDegreeLevel",
    values.preferredDegreeLevel,
    prev.preferredDegreeLevel,
  );
  setIfChanged(
    "preferredCollegeType",
    values.preferredCollegeType ?? "", // cleared Select yields undefined → ""
    prev.preferredCollegeType,
  );

  const nextStates = (values.preferredStates ?? []).map((s) => s.toUpperCase());
  if (!sameStringSet(nextStates, prev.preferredStates)) {
    patch.preferredStates = nextStates;
  }
  const nextPrograms = values.preferredPrograms ?? [];
  if (!sameStringSet(nextPrograms, prev.preferredPrograms)) {
    patch.preferredPrograms = nextPrograms;
  }

  return patch;
}

// Friendly text for the Firebase auth error codes surfaced by credential changes.
function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Your current password is incorrect.";
  }
  if (code === "auth/weak-password") {
    return "The new password is too weak (use at least 6 characters).";
  }
  if (code === "auth/email-already-in-use") {
    return "That email address is already in use by another account.";
  }
  if (code === "auth/requires-recent-login") {
    return "For security, please sign out and back in, then try again.";
  }
  return fallback;
}

export default function ProfileDashboard({ authUser }: ProfileDashboardProps) {
  // Primary student profile. Starts blank (identity from the signed-in user,
  // academics/preferences empty) and is populated solely by GET /profile — no
  // mock/sample data is ever shown.
  const [profile, setProfile] = useState<StudentProfile>(() =>
    emptyProfile(authUser),
  );

  // Load the real profile from the backend (GET /profile, via the authed-fetch
  // wrapper). Missing fields keep their seeded defaults so the UI still renders
  // if the backend is unavailable.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchProfile<Record<string, unknown>>();
        if (active && data) setProfile((prev) => mergeProfile(prev, data));
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // The match tiles' heart indicator, the Saved Colleges grid, and the Compare
  // section all read from their own shared stores (`/saved-colleges` and
  // `/compare/selected`), which keep each other in sync — so no saved/compare
  // state is held here.
  const [savedCollegesView, setSavedCollegesView] = useState<"Grid" | "List">(
    "Grid",
  );

  // Modal display toggles
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [accountDeactivatedStatus, setAccountDeactivatedStatus] =
    useState(false);

  // College matches — driven by the user's target states & majors, pulled live
  // from the backend (no mock data). Re-runs when those preferences change.
  const { matches, loading: matchesLoading } = useCollegeMatches(profile);

  // Handle Profile Update Confirmation — persists via PATCH /profile.
  const onProfileSave = async (
    values: Omit<StudentProfile, "createdDate" | "lastLogin">,
  ) => {
    // Map to the camelCase backend body (only changed fields); email is never
    // sent (Firebase-managed).
    const patch = toProfilePatch(profile, values);

    // Nothing changed — skip the network round-trip.
    if (Object.keys(patch).length === 0) {
      setIsEditProfileOpen(false);
      return;
    }

    try {
      const updated = await patchProfile<Record<string, unknown>>(patch);
      setProfile((prev) => mergeProfile(prev, updated ?? patch));
      setIsEditProfileOpen(false);
      message.success("Academic profile and preferences updated successfully!");
    } catch (err) {
      console.error("Profile save failed:", err);
      message.error("Could not save your profile. Please try again.");
    }
  };

  // Action: Password change — Firebase SDK only (no backend endpoint).
  const handlePasswordSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const current = auth.currentUser;
    if (!current || !current.email) {
      message.error("You must be signed in to change your password.");
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      message.error("The passwords do not match!");
      return;
    }

    try {
      try {
        await updatePassword(current, values.newPassword);
      } catch (err) {
        // Firebase requires a recent login for sensitive changes — reauth then retry.
        if ((err as { code?: string }).code === "auth/requires-recent-login") {
          const credential = EmailAuthProvider.credential(
            current.email,
            values.currentPassword,
          );
          await reauthenticateWithCredential(current, credential);
          await updatePassword(current, values.newPassword);
        } else {
          throw err;
        }
      }

      setIsChangePasswordOpen(false);
      notification.success({
        message: "Password Updated",
        description:
          "Your account security credentials have been updated successfully.",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (err) {
      console.error("Password change failed:", err);
      message.error(
        getAuthErrorMessage(err, "Could not update your password."),
      );
    }
  };

  // Action: Email change — Firebase sends a verification link; the change takes
  // effect after the user clicks it, and the backend mirrors it on next login.
  const handleEmailSubmit = async (values: { newEmail: string }) => {
    const current = auth.currentUser;
    if (!current) {
      message.error("You must be signed in to change your email.");
      return;
    }

    try {
      await verifyBeforeUpdateEmail(current, values.newEmail);
      setIsChangeEmailOpen(false);
      notification.success({
        message: "Verification link sent",
        description: `We sent a confirmation link to ${values.newEmail}. Your email updates after you click it.`,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (err) {
      console.error("Email change failed:", err);
      message.error(
        getAuthErrorMessage(err, "Could not start the email change."),
      );
    }
  };

  // Account deletion: backend soft-delete, then Firebase sign-out + clear the
  // app JWT (validation handled inside the modal).
  const onConfirmDeactivate = async (payload: DeactivationPayload) => {
    try {
      await deleteAccount(payload); // POST /account/delete (app JWT)
    } catch (err) {
      console.error("Account deletion failed:", err);
      message.error("We couldn't deactivate your account. Please try again.");
      return;
    }

    setIsDeactivateOpen(false);
    setAccountDeactivatedStatus(true);

    try {
      await signOut(auth); // a soft-deleted account must not stay signed in
    } catch (err) {
      console.error("Sign-out after deletion failed:", err);
    }
    clearAppJwt();
  };

  if (accountDeactivatedStatus) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Result
          status="warning"
          title="Profile Deactivated Successfully"
          subTitle="In accordance with your preferences, your U.S. Degrees Counsel account data has been marked for deactivation. Your profile will not appear in our matchmaking metrics."
        />
      </div>
    );
  }

  return (
    <div
      id="student_profile_dashboard_page"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12"
    >
      {/* New-user prompt: shown only when no profile data has been entered yet.
          No fabricated/placeholder values are displayed — just an invitation. */}
      {isProfileEmpty(profile) && (
        <Alert
          type="info"
          showIcon
          className="rounded-2xl"
          title="Complete your profile to get personalized recommendations"
          description="Add your academic details and preferences so we can match you with the right colleges."
          action={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditProfileOpen(true)}
            >
              Complete your profile
            </Button>
          }
        />
      )}

      {/* Upper Main Grid Section (Profile Info and Academics) */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <ProfileInfoCard
            profile={profile}
            onEdit={() => setIsEditProfileOpen(true)}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onChangeEmail={() => setIsChangeEmailOpen(true)}
          />
        </Col>

        <Col xs={24} lg={10}>
          <div className="flex flex-col gap-6 h-full justify-between">
            <AcademicInfoCard
              profile={profile}
              onEdit={() => setIsEditProfileOpen(true)}
            />
            <PreferencesCard
              profile={profile}
              onEdit={() => setIsEditProfileOpen(true)}
            />
          </div>
        </Col>
      </Row>

      {/* My Matches */}
      <CollegeMatchesSection matches={matches} loading={matchesLoading} />

      {/* Saved Colleges — self-fetches from GET /saved-colleges */}
      <SavedCollegesSection
        view={savedCollegesView}
        onViewChange={setSavedCollegesView}
      />

      {/* Compare List — self-fetches from GET /compare/selected */}
      <CompareListSection />

      {/* Danger Zone */}
      <DangerZoneCard onDeactivate={() => setIsDeactivateOpen(true)} />

      {/* Modals */}
      <EditProfileModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSave={onProfileSave}
      />
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSubmit={handlePasswordSubmit}
      />
      <ChangeEmailModal
        open={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        currentEmail={profile.email}
        onSubmit={handleEmailSubmit}
      />
      <DeactivateAccountModal
        open={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={onConfirmDeactivate}
      />
    </div>
  );
}
