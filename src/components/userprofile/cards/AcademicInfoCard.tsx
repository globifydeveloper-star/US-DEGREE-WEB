"use client";

import React from "react";
import { Card, Button, Row, Col } from "antd";
import { BookOutlined, HomeOutlined, EditOutlined } from "@ant-design/icons";
import { StudentProfile } from "../../../types/profile";

interface AcademicInfoCardProps {
  profile: StudentProfile;
  onEdit: () => void;
}

const BRAND_BLUE = "#3b5bdb";

export default function AcademicInfoCard({
  profile,
  onEdit,
}: AcademicInfoCardProps) {
  return (
    <Card
      id="academics_summary_card"
      title={
        <div className="flex flex-col gap-3 py-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 font-bold">
            <BookOutlined className="text-emerald-600" />
            High School &amp; Test Performance
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
      className="shadow-md rounded-2xl flex-1 border border-neutral-100"
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Institution Secondary
          </h4>
          <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
            <HomeOutlined className="text-neutral-400" />
            {profile.highSchoolName || "Not provided"}
          </p>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs">
            <div>
              <span className="text-neutral-400 block font-normal">
                Graduation Target
              </span>
              <span className="font-bold text-neutral-800 text-sm mt-0.5 block">
                {profile.graduationYear ?? "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block font-normal">
                Cumulative GPA
              </span>
              <span className="font-extrabold text-blue-600 text-sm mt-0.5 block">
                {profile.gpa != null ? `${profile.gpa} / 4.0` : "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-4">
          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
            Standardized Exams Results
          </h4>

          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <div className="bg-neutral-50/70 py-2.5 px-3 rounded-xl border border-neutral-150 text-center h-full flex flex-col justify-center">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  SAT Reading
                </span>
                <span className="font-extrabold text-neutral-800 text-base">
                  {profile.satReadingWriting ?? "—"}
                </span>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <div className="bg-neutral-50/70 py-2.5 px-3 rounded-xl border border-neutral-150 text-center h-full flex flex-col justify-center">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                  SAT Mathematics
                </span>
                <span className="font-extrabold text-neutral-800 text-base">
                  {profile.satMath ?? "—"}
                </span>
              </div>
            </Col>
            {profile.actScore && (
              <Col xs={24} sm={8}>
                <div className="bg-amber-50/50 py-2.5 px-3 rounded-xl border border-amber-100 text-center h-full flex flex-col justify-center">
                  <span className="text-[10px] text-amber-600 uppercase font-semibold block">
                    ACT Score
                  </span>
                  <span className="font-extrabold text-amber-800 text-base">
                    {profile.actScore}
                  </span>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </Card>
  );
}
