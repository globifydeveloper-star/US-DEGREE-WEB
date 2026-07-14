"use client";

import React from "react";
import { Card, Avatar, Descriptions, Button, Tag, Progress } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  LockOutlined,
  BookOutlined,
  SettingOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";

interface ProfileInfoCardProps {
  profile: StudentProfile;
  onEdit: () => void;
  onChangePassword: () => void;
  onChangeEmail: () => void;
}

// US Degrees brand blue used for themed outline buttons.
const BRAND_BLUE = "#3b5bdb";

export default function ProfileInfoCard({
  profile,
  onEdit,
  onChangePassword,
  onChangeEmail,
}: ProfileInfoCardProps) {
  // Overall completion = average of the three profile dashboard sections'
  // own completion rates (Profile Info, Academics, Match Preferences).
  const profileInfoFields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.address,
  ];
  const academicFields = [
    profile.highSchoolName,
    profile.graduationYear,
    profile.gpa,
    profile.satScore,
  ];
  const preferenceFields = [
    profile.preferredStates.length > 0,
    profile.preferredPrograms.length > 0,
    profile.preferredDegreeLevel,
    profile.preferredCollegeType,
  ];
  const sectionCompletion = (fields: unknown[]) =>
    fields.filter(Boolean).length / fields.length;
  const profileCompletion = Math.round(
    ((sectionCompletion(profileInfoFields) +
      sectionCompletion(academicFields) +
      sectionCompletion(preferenceFields)) /
      3) *
      100,
  );

  return (
    <Card
      id="profile_info_card"
      title={
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-bold">
            <UserOutlined className="text-blue-600" />
            Student Profile Information
          </span>
          <Button
            icon={<SettingOutlined />}
            onClick={onEdit}
            className="w-full sm:w-auto"
            style={{
              borderRadius: "8px",
              borderColor: BRAND_BLUE,
              color: BRAND_BLUE,
            }}
          >
            Edit Academic Info
          </Button>
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl h-full border border-neutral-100"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <Avatar
          size={80}
          icon={<UserOutlined />}
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
            profile.fullName || profile.email || "student",
          )}`}
          className="bg-blue-100 border-2 border-blue-500 shadow-sm"
        />
        <div className="text-center sm:text-left space-y-1 w-full">
          <h2 className="text-xl font-bold text-neutral-900">
            {profile.fullName || "Not provided"}
          </h2>
          <Progress
            percent={profileCompletion}
            format={(percent) => `${percent}%`}
            style={{ marginTop: 10 }}
          />
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            {profile.preferredDegreeLevel && (
              <Tag
                color="cyan"
                variant="solid"
                style={{ borderRadius: "6px" }}
                icon={<BookOutlined />}
              >
                {profile.preferredDegreeLevel} Preference
              </Tag>
            )}
            {/* <Tag
              color="blue"
              style={{ borderRadius: "6px" }}
              icon={<SecurityScanOutlined />}
            >
              Verified Student ID
            </Tag> */}
          </div>
        </div>
      </div>

      <Descriptions
        bordered
        column={1}
        className="mb-6 rounded-lg overflow-hidden border border-neutral-150"
      >
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <MailOutlined className="text-neutral-400" /> Email
            </span>
          }
        >
          <span className="font-medium text-neutral-700">
            {profile.email || "Not provided"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <PhoneOutlined className="text-neutral-400" /> Phone
            </span>
          }
        >
          <span className="font-medium text-neutral-700">
            {profile.phone || "—"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <HomeOutlined className="text-neutral-400" /> Address
            </span>
          }
        >
          <span className="font-medium text-neutral-700">
            {profile.address || "—"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <CalendarOutlined className="text-neutral-400" /> Registered On
            </span>
          }
        >
          <span className="font-medium text-neutral-600">
            {profile.createdDate || "—"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <CalendarOutlined className="text-neutral-400" /> Last Active
              login
            </span>
          }
        >
          <span className="font-medium text-neutral-600">
            {profile.lastLogin || "—"}
          </span>
        </Descriptions.Item>
      </Descriptions>

      {/* Account security actions — full width on mobile, side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={onChangePassword}
          icon={<LockOutlined />}
          className="w-full"
          style={{ borderRadius: "8px" }}
        >
          Change Password
        </Button>
        <Button
          onClick={onChangeEmail}
          icon={<MailOutlined />}
          className="w-full"
          style={{ borderRadius: "8px" }}
        >
          Change Email Address
        </Button>
      </div>
    </Card>
  );
}
