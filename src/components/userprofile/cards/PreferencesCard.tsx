"use client";

import React from "react";
import { Card, Button, Tag, Skeleton } from "antd";
import { CompassOutlined, EditOutlined } from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";
import { useStates } from "../../../lib/referenceData";

interface PreferencesCardProps {
  profile: StudentProfile;
  loading?: boolean;
  onEdit: () => void;
}

const BRAND_BLUE = "#3b5bdb";

export default function PreferencesCard({
  profile,
  loading = false,
  onEdit,
}: PreferencesCardProps) {
  // Map stored 2-letter codes to full names using the canonical backend list.
  const { states } = useStates();
  const stateName = (code: string) =>
    states.find((s) => s.code === code)?.name || code;

  const cardTitle = (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex items-center gap-2 font-bold text-sm sm:text-base min-w-0">
        <CompassOutlined className="text-indigo-600 shrink-0" />
        <span className="truncate">Match Preferences Board</span>
      </span>
      <Button
        size="small"
        icon={<EditOutlined />}
        onClick={onEdit}
        disabled={loading}
        className="shrink-0"
        style={{
          borderRadius: "8px",
          borderColor: BRAND_BLUE,
          color: BRAND_BLUE,
        }}
      >
        Edit
      </Button>
    </div>
  );

  if (loading) {
    return (
      <Card
        id="preferences_summary_card"
        title={cardTitle}
        variant="borderless"
        className="shadow-md rounded-2xl border border-neutral-100"
      >
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card
      id="preferences_summary_card"
      title={cardTitle}
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100"
    >
      <div className="space-y-4">
        <div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
            Preferred States
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.preferredStates.length === 0 ? (
              <span className="text-xs text-neutral-400 italic">
                No preferred states chosen.
              </span>
            ) : (
              profile.preferredStates.map((st) => (
                <Tag
                  key={st}
                  color="geekblue"
                  style={{ borderRadius: "6px" }}
                  className="font-medium px-2.5 py-0.5"
                >
                  {stateName(st)}
                </Tag>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-3">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
            Preferred Majors & Curriculums
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.preferredPrograms.length === 0 ? (
              <span className="text-xs text-neutral-400 italic">
                No programs chosen yet.
              </span>
            ) : (
              profile.preferredPrograms.map((major) => (
                <Tag
                  key={major}
                  color="emerald"
                  style={{ borderRadius: "6px" }}
                  className="font-medium px-2.5 py-0.5"
                >
                  {major}
                </Tag>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-3 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
              Preferred College Type
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferredCollegeType ? (
                <Tag
                  color="purple"
                  style={{ borderRadius: "6px" }}
                  className="font-medium px-2.5 py-0.5"
                >
                  {profile.preferredCollegeType}
                </Tag>
              ) : (
                <span className="text-xs text-neutral-400 italic">
                  No preference (Public & Private).
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-2">
              Target Degree Level
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferredDegreeLevel ? (
                <Tag
                  color="cyan"
                  style={{ borderRadius: "6px" }}
                  className="font-medium px-2.5 py-0.5"
                >
                  {profile.preferredDegreeLevel}
                </Tag>
              ) : (
                <span className="text-xs text-neutral-400 italic">
                  Not selected.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
