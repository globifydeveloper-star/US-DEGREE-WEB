/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

"use client";

import React from "react";
import { Result, Row, Col } from "antd";

import ProfileInfoCard from "./cards/ProfileInfoCard";
import AcademicInfoCard from "./cards/AcademicInfoCard";
import PreferencesCard from "./cards/PreferencesCard";
import CollegeMatchesSection from "./cards/CollegeMatchesSection";
import SavedCollegesSection from "./cards/SavedCollegesSection";
import MyReportsSection from "./cards/MyReportsSection";
import DangerZoneCard from "./cards/DangerZoneCard";

import EditProfileModal from "./modals/EditProfileModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import ChangeEmailModal from "./modals/ChangeEmailModal";
import DeactivateAccountModal from "./modals/DeactivateAccountModal";

import CompleteProfileAlert from "./CompleteProfileAlert";
import { useProfileDashboard } from "./useProfileDashboard";
import {
  emptyProfile,
  isProfileEmpty,
  mergeProfile,
  type ProfileAuthUser,
} from "./profileUtils";

// Re-export helper functions used elsewhere for backwards compatibility
export { emptyProfile, mergeProfile };

interface ProfileDashboardProps {
  authUser?: ProfileAuthUser | null;
}

/**
 * Main Student Profile Dashboard view component.
 */
export default function ProfileDashboard({ authUser }: ProfileDashboardProps) {
  const {
    profile,
    isProfileLoading,
    savedCollegesView,
    setSavedCollegesView,
    isEditProfileOpen,
    setIsEditProfileOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    isChangeEmailOpen,
    setIsChangeEmailOpen,
    isDeactivateOpen,
    setIsDeactivateOpen,
    accountDeactivatedStatus,
    matches,
    matchesLoading,
    onProfileSave,
    handlePasswordSubmit,
    handleEmailSubmit,
    onConfirmDeactivate,
  } = useProfileDashboard(authUser);

  // Render Deactivated Account View
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
      {/* Complete Profile prompt for new users */}
      {isProfileEmpty(profile) && (
        <CompleteProfileAlert onOpenEdit={() => setIsEditProfileOpen(true)} />
      )}

      {/* Main Grid: Student Info, Academic Info & Preferences */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <ProfileInfoCard
            profile={profile}
            loading={isProfileLoading}
            onEdit={() => setIsEditProfileOpen(true)}
            onChangePassword={() => setIsChangePasswordOpen(true)}
            onChangeEmail={() => setIsChangeEmailOpen(true)}
          />
        </Col>

        <Col xs={24} lg={10}>
          <div className="flex flex-col gap-6 h-full justify-between">
            <AcademicInfoCard
              profile={profile}
              loading={isProfileLoading}
              onEdit={() => setIsEditProfileOpen(true)}
            />
            <PreferencesCard
              profile={profile}
              loading={isProfileLoading}
              onEdit={() => setIsEditProfileOpen(true)}
            />
          </div>
        </Col>
      </Row>

      {/* Match Engine Recommendations */}
      <CollegeMatchesSection matches={matches} loading={matchesLoading} />

      {/* Saved Colleges */}
      <SavedCollegesSection
        view={savedCollegesView}
        onViewChange={setSavedCollegesView}
      />

      {/* Generated Reports */}
      <MyReportsSection />

      {/* Danger Zone */}
      <DangerZoneCard onDeactivate={() => setIsDeactivateOpen(true)} />

      {/* Profile & Security Modals */}
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
