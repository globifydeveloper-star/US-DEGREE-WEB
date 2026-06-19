"use client";

import React from "react";
import { Card, Button, Tag } from "antd";
import { CompassOutlined, EditOutlined } from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";
import { useStates } from "../../../lib/referenceData";

interface PreferencesCardProps {
  profile: StudentProfile;
  onEdit: () => void;
}

const BRAND_BLUE = "#3b5bdb";

export default function PreferencesCard({
  profile,
  onEdit,
}: PreferencesCardProps) {
  // Map stored 2-letter codes to full names using the canonical backend list.
  const { states } = useStates();
  const stateName = (code: string) =>
    states.find((s) => s.code === code)?.name || code;

  return (
    <Card
      id="preferences_summary_card"
      title={
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-bold">
            <CompassOutlined className="text-indigo-600" />
            Match Preferences Board
          </span>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
            className="w-full sm:w-auto"
            style={{
              borderRadius: "8px",
              borderColor: BRAND_BLUE,
              color: BRAND_BLUE,
            }}
          >
            Edit
          </Button>
        </div>
      }
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
      </div>
    </Card>
  );
}
