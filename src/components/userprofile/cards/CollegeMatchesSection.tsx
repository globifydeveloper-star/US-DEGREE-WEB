"use client";

import React from "react";
import { Card, Button, Progress, Row, Col, Space, Badge, Tooltip } from "antd";
import {
  GlobalOutlined,
  HeartOutlined,
  HeartFilled,
  SyncOutlined,
  CompassOutlined,
} from "@ant-design/icons";
import { University } from "../../../types/profile";
import { CollegeMatch } from "../matchEngine";

interface CollegeMatchesSectionProps {
  matches: CollegeMatch[];
  savedColleges: University[];
  compareList: University[];
  onQuickView: (uni: University) => void;
  onToggleCompare: (uni: University) => void;
  onRemoveSaved: (id: string, name: string) => void;
  onAddSaved: (uni: University) => void;
}

export default function CollegeMatchesSection({
  matches,
  savedColleges,
  compareList,
  onQuickView,
  onToggleCompare,
  onRemoveSaved,
  onAddSaved,
}: CollegeMatchesSectionProps) {
  return (
    <Card
      id="college_matches_section"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-2">
          <Space>
            <CompassOutlined className="text-amber-500 text-lg" />
            <div>
              <span className="font-bold text-base block">
                My Intelligent College Matches
              </span>
              <span className="text-xs text-neutral-400 font-normal block">
                Calculated using standardized SAT profile, target state, and
                major alignments
              </span>
            </div>
          </Space>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-500 font-semibold tracking-wide uppercase">
              Realtime Engine active
            </span>
          </div>
        </div>
      }
      bordered={false}
      className="shadow-md rounded-2xl border border-neutral-100 bg-linear-to-b from-white to-blue-50/10"
    >
      <Row gutter={[20, 20]}>
        {matches.slice(0, 3).map((match) => {
          const isSaved = savedColleges.some(
            (u) => u.id === match.university.id,
          );
          const isCompared = compareList.some(
            (u) => u.id === match.university.id,
          );

          // Determine badge color
          let badgeColorStr = "blue";
          if (match.badgeType === "Strong Match") badgeColorStr = "success";
          else if (match.badgeType === "Reach School")
            badgeColorStr = "warning";

          return (
            <Col xs={24} md={8} key={match.university.id}>
              <Card
                bordered
                hoverable
                className="rounded-2xl h-full border-neutral-150 shadow-xs flex flex-col justify-between"
                bodyStyle={{
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <div className="space-y-4">
                  {/* Header: Match Score Progress & Score Badge */}
                  <div className="flex justify-between items-start">
                    <div className="text-center">
                      <Progress
                        type="circle"
                        percent={match.percentage}
                        size={54}
                        strokeWidth={10}
                        strokeColor={{
                          "0%": "#108ee9",
                          "100%": "#87d068",
                        }}
                        format={(percent?: number) => (
                          <span className="font-extrabold text-xs text-neutral-900">
                            {percent}%
                          </span>
                        )}
                      />
                      <span className="text-[9px] text-neutral-400 block font-bold uppercase mt-1">
                        Match Percentage
                      </span>
                    </div>

                    <Badge
                      status={
                        badgeColorStr === "success"
                          ? "success"
                          : badgeColorStr === "warning"
                            ? "warning"
                            : "processing"
                      }
                      text={
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            match.badgeType === "Strong Match"
                              ? "bg-emerald-50 text-emerald-700"
                              : match.badgeType === "Reach School"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {match.badgeType}
                        </span>
                      }
                    />
                  </div>

                  {/* University Basic Info */}
                  <div className="pt-2">
                    <h4 className="text-sm font-extrabold text-neutral-800 line-clamp-1">
                      {match.university.name}
                    </h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <GlobalOutlined />
                      {match.university.city}, {match.university.state}
                    </p>
                  </div>

                  {/* Quality factors statistic row */}
                  <div className="grid grid-cols-2 gap-2 border-y border-neutral-100 py-3 text-xs bg-neutral-50/50 rounded-xl px-2">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Tuition rate
                      </span>
                      <span className="font-bold text-neutral-700">
                        ${match.university.annualCost.toLocaleString()}/yr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Acceptance Gate
                      </span>
                      <span className="font-bold text-neutral-700">
                        {match.university.acceptanceRate}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-100/50">
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Graduation rate
                      </span>
                      <span className="font-bold text-neutral-700">
                        {match.graduationRate}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-100/50">
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Post Salary Mean
                      </span>
                      <span className="font-bold text-neutral-700">
                        ${match.estimatedSalary.toLocaleString()}/yr
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions buttons */}
                <div className="pt-4 flex items-center justify-between gap-2">
                  <Button
                    type="text"
                    onClick={() => onQuickView(match.university)}
                    className="text-xs font-semibold hover:text-blue-600 px-0 flex items-center gap-1"
                  >
                    Quick Review Detail →
                  </Button>

                  <div className="flex gap-2">
                    <Tooltip
                      title={
                        isCompared
                          ? "Remove from comparison"
                          : "Add to comparison block"
                      }
                    >
                      <Button
                        icon={
                          isCompared ? (
                            <SyncOutlined spin className="text-blue-500" />
                          ) : (
                            <SyncOutlined className="text-neutral-400" />
                          )
                        }
                        onClick={() => onToggleCompare(match.university)}
                        className={
                          isCompared ? "border-blue-500" : "border-neutral-200"
                        }
                        size="small"
                        shape="circle"
                      />
                    </Tooltip>

                    <Tooltip
                      title={
                        isSaved
                          ? "Already in saved colleges"
                          : "Save this college"
                      }
                    >
                      <Button
                        icon={
                          isSaved ? (
                            <HeartFilled className="text-red-500" />
                          ) : (
                            <HeartOutlined className="text-neutral-400" />
                          )
                        }
                        onClick={() => {
                          if (isSaved) {
                            onRemoveSaved(
                              match.university.id,
                              match.university.name,
                            );
                          } else {
                            onAddSaved(match.university);
                          }
                        }}
                        className={`${isSaved ? "border-red-500 bg-red-50/10" : "border-neutral-200"}`}
                        size="small"
                        shape="circle"
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
