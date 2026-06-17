/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Result, Row, Col, message, notification } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { INITIAL_PROFILE, StudentProfile } from "../../data/mockProfile";
import { UNIVERSITIES } from "../../data/mockColleges";
import { University } from "../../types/profile";
import { computeCollegeMatches } from "./matchEngine";

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
  onQuickViewUniversity?: (uni: University) => void;
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

export default function ProfileDashboard({
  onQuickViewUniversity,
  authUser,
}: ProfileDashboardProps) {
  const router = useRouter();

  // Quick view falls back to an informational toast when no handler is supplied
  // (the mock universities have no live detail page).
  const handleQuickView = (uni: University) => {
    if (onQuickViewUniversity) {
      onQuickViewUniversity(uni);
    } else {
      message.info(`${uni.name} — detailed view is coming soon.`);
    }
  };

  // Primary student profile (seeded with the real user's name/email and DB
  // registration/last-login dates when available; academics remain mock).
  const [profile, setProfile] = useState<StudentProfile>({
    ...INITIAL_PROFILE,
    fullName: authUser?.displayName ?? INITIAL_PROFILE.fullName,
    email: authUser?.email ?? INITIAL_PROFILE.email,
    createdDate: formatDbDate(authUser?.createdAt, INITIAL_PROFILE.createdDate),
    lastLogin: formatDbDate(authUser?.lastLogin, INITIAL_PROFILE.lastLogin),
  });

  // Saved Colleges list - prepopulated with 12 colleges for the "Saved Colleges (12)" display.
  const [savedColleges, setSavedColleges] = useState<University[]>([
    ...UNIVERSITIES, // Stanford, Berkeley, MIT, Harvard, NYU, Columbia, UT Austin, Rice, UChicago, UW, UPenn
    {
      id: "caltech",
      unitid: "110404",
      name: "California Institute of Technology",
      city: "Pasadena",
      state: "CA",
      type: "Private",
      ranking: 5,
      acceptanceRate: 3.9,
      annualCost: 60800,
      rating: 4.9,
      description:
        "The California Institute of Technology is a private research university in Pasadena, California, esteemed for its groundbreaking science and engineering fields.",
      logoColor: "bg-orange-600 text-white",
      image:
        "https://images.unsplash.com/photo-1544535830-9df3f56fff6a?q=80&w=800&auto=format&fit=crop",
    },
  ]);

  // Active compared colleges list - starts with two selected for interactive comparison
  const [compareList, setCompareList] = useState<University[]>([
    UNIVERSITIES[0], // Stanford
    UNIVERSITIES[1], // UC Berkeley
  ]);

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

  // Dynamic College Matchmaker — combines SAT score, preferred states, programs and degree level.
  const matches = useMemo(() => computeCollegeMatches(profile), [profile]);

  // Handle Profile Update Confirmation
  const onProfileSave = (
    values: Omit<StudentProfile, "createdDate" | "lastLogin">,
  ) => {
    setProfile((prev) => ({
      ...prev,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      highSchoolName: values.highSchoolName,
      graduationYear: values.graduationYear,
      gpa: values.gpa,
      satReadingWriting: values.satReadingWriting,
      satMath: values.satMath,
      actScore: values.actScore,
      preferredStates: values.preferredStates || prev.preferredStates,
      preferredPrograms: values.preferredPrograms || prev.preferredPrograms,
      preferredDegreeLevel:
        values.preferredDegreeLevel || prev.preferredDegreeLevel,
    }));
    setIsEditProfileOpen(false);
    message.success("Academic profile and preferences updated successfully!");
  };

  // Action: Add/Remove from Compare List
  const handleToggleCompare = (uni: University) => {
    setCompareList((prev) => {
      const exists = prev.some((u) => u.id === uni.id);
      if (exists) {
        message.info(`Removed ${uni.name} from comparison.`);
        return prev.filter((u) => u.id !== uni.id);
      }
      if (prev.length >= 4) {
        message.warning("You can compare a maximum of 4 colleges at a time.");
        return prev;
      }
      message.success(`Added ${uni.name} to compare list.`);
      return [...prev, uni];
    });
  };

  // Action: Remove from Saved List
  const handleRemoveSaved = (id: string, name: string) => {
    setSavedColleges((prev) => prev.filter((u) => u.id !== id));
    setCompareList((prev) => prev.filter((u) => u.id !== id));
    message.success(`${name} removed from your saved list.`);
  };

  // Action: Add back helper
  const handleAddSaved = (uni: University) => {
    if (savedColleges.some((u) => u.id === uni.id)) {
      message.info(`${uni.name} is already in saved list.`);
      return;
    }
    setSavedColleges((prev) => [...prev, uni]);
    message.success(`${uni.name} added to your saved colleges.`);
  };

  // Action: Password Modal Submit Handler
  const handlePasswordSubmit = (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("The passwords do not match!");
      return;
    }
    setIsChangePasswordOpen(false);
    notification.success({
      message: "Password Updated",
      description:
        "Your account security credentials have been updated successfully today.",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    });
  };

  // Action: Email Modal Submit Handler
  const handleEmailSubmit = (values: { newEmail: string }) => {
    setProfile((prev) => ({ ...prev, email: values.newEmail }));
    setIsChangeEmailOpen(false);
    message.success("Email settings modified successfully! Saved.");
  };

  // Action: Compare Now — hand the selected colleges' unitids to the live
  // /compare page (same localStorage + URL contract used by useCompareColleges).
  const handleCompareNow = () => {
    const ids = compareList.map((u) => u.unitid).filter(Boolean);
    if (ids.length < 2) return;

    try {
      localStorage.setItem("compared_colleges", JSON.stringify(ids));
      const details = compareList.map((u) => ({
        id: u.unitid,
        name: u.name,
        city: u.city,
        state: u.state,
        schoolType: u.type,
        location: `${u.city}, ${u.state}`,
        cipCode: "default",
      }));
      localStorage.setItem(
        "compared_colleges_details",
        JSON.stringify(details),
      );
      window.dispatchEvent(new Event("compared-colleges-updated"));
    } catch (e) {
      console.error("Failed to seed compare selection:", e);
    }

    router.push(`/compare?ids=${ids.join(",")}`);
  };

  // Trigger Deactivation Complete (validation handled inside the modal).
  const onConfirmDeactivate = () => {
    setAccountDeactivatedStatus(true);
    setIsDeactivateOpen(false);
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
      <CollegeMatchesSection
        matches={matches}
        savedColleges={savedColleges}
        compareList={compareList}
        onQuickView={handleQuickView}
        onToggleCompare={handleToggleCompare}
        onRemoveSaved={handleRemoveSaved}
        onAddSaved={handleAddSaved}
      />

      {/* Saved Colleges */}
      <SavedCollegesSection
        savedColleges={savedColleges}
        view={savedCollegesView}
        onViewChange={setSavedCollegesView}
        preferredStates={profile.preferredStates}
        onQuickView={handleQuickView}
        onRemoveSaved={handleRemoveSaved}
      />

      {/* Compare List */}
      <CompareListSection
        compareList={compareList}
        onToggleCompare={handleToggleCompare}
        onClearAll={() => {
          setCompareList([]);
          message.info("Comparison bucket cleared successfully.");
        }}
        onCompareNow={handleCompareNow}
      />

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
