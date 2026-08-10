"use client";

import React from "react";
import {
  Card,
  Avatar,
  Descriptions,
  Button,
  Tag,
  Progress,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  LockOutlined,
  BookOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";
import { calculateProfileCompletion } from "../../../lib/profileCompletion";
import { useAuth } from "../../../context/AuthContext";
import { useEmailVerification } from "../../../hooks/useEmailVerification";

interface ProfileInfoCardProps {
  profile: StudentProfile;
  loading?: boolean;
  onEdit: () => void;
  onChangePassword: () => void;
  onChangeEmail: () => void;
}

// US Degrees brand blue used for themed outline buttons.
const BRAND_BLUE = "#3b5bdb";

export default function ProfileInfoCard({
  profile,
  loading = false,
  onEdit,
  onChangePassword,
  onChangeEmail,
}: ProfileInfoCardProps) {
  const profileCompletion = calculateProfileCompletion(profile);
  const { user } = useAuth();
  const { resending, resent, handleResendEmail } = useEmailVerification();
  const isEmailVerified = !!user?.emailVerified;

  const cardTitle = (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex items-center gap-2 font-bold text-sm sm:text-base min-w-0">
        <UserOutlined className="text-blue-600 shrink-0" />
        <span className="truncate">Student Profile Information</span>
      </span>
      <Button
        size="small"
        icon={<SettingOutlined />}
        onClick={onEdit}
        disabled={loading}
        className="shrink-0"
        style={{
          borderRadius: "8px",
          borderColor: BRAND_BLUE,
          color: BRAND_BLUE,
        }}
      >
        <span className="hidden sm:inline">Edit Academic Info</span>
        <span className="sm:hidden">Edit</span>
      </Button>
    </div>
  );

  if (loading) {
    return (
      <Card
        id="profile_info_card"
        title={cardTitle}
        variant="borderless"
        className="shadow-md rounded-2xl h-full border border-neutral-100"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <Skeleton.Avatar active size={80} shape="circle" />
          <div className="w-full space-y-2">
            <Skeleton.Input active size="small" style={{ width: 160 }} />
            <Skeleton.Input active size="small" block />
          </div>
        </div>
        <Skeleton active title={false} paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  return (
    <Card
      id="profile_info_card"
      title={cardTitle}
      variant="borderless"
      className="shadow-md rounded-2xl h-full border border-neutral-100"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        <Avatar
          size={80}
          shape="circle"
          icon={<UserOutlined />}
          src={`https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(
            profile.fullName || profile.email || "student",
          )}`}
          className="bg-blue-100 border-2 border-blue-500 shadow-sm shrink-0 rounded-full aspect-square"
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-700">
              {profile.email || "Not provided"}
            </span>
            {profile.email &&
              (isEmailVerified ? (
                <Tag
                  color="success"
                  icon={<CheckCircleOutlined />}
                  style={{ borderRadius: "6px" }}
                >
                  Verified
                </Tag>
              ) : (
                <>
                  <Tag
                    color="error"
                    icon={<ExclamationCircleOutlined />}
                    style={{ borderRadius: "6px" }}
                  >
                    Not Verified
                  </Tag>
                  <Button
                    size="small"
                    onClick={handleResendEmail}
                    loading={resending}
                    disabled={resent}
                    style={{
                      borderRadius: "6px",
                      borderColor: BRAND_BLUE,
                      color: BRAND_BLUE,
                    }}
                  >
                    {resent ? "Link Sent" : "Verify Now"}
                  </Button>
                </>
              ))}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <span className="font-bold flex items-center gap-1.5">
              <PhoneOutlined className="text-neutral-400 -scale-x-100" />
              Phone
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

      {/* Account security actions — evenly split in a single row at every size */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button
          onClick={onChangePassword}
          icon={<LockOutlined />}
          className="w-full font-semibold"
          style={{
            borderRadius: "8px",
            borderColor: BRAND_BLUE,
            color: BRAND_BLUE,
          }}
        >
          Change Password
        </Button>
        <Button
          onClick={onChangeEmail}
          icon={<MailOutlined />}
          className="w-full font-semibold"
          style={{
            borderRadius: "8px",
            borderColor: BRAND_BLUE,
            color: BRAND_BLUE,
          }}
        >
          <span className="hidden sm:inline">Change Email Address</span>
          <span className="sm:hidden">Change Email</span>
        </Button>
      </div>
    </Card>
  );
}
