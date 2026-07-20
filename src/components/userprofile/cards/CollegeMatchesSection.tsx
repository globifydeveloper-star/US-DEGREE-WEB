"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Row,
  Col,
  Space,
  Tooltip,
  Empty,
  Spin,
  Avatar,
  Segmented,
  message,
} from "antd";
import {
  GlobalOutlined,
  HeartOutlined,
  HeartFilled,
  SyncOutlined,
  CompassOutlined,
  ReadOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { CollegeMatch } from "../matchEngine";
import {
  toggleCompare as toggleCompareStore,
  useCompareIds,
  MAX_COMPARE,
} from "../../search/useCompareSelected";
import {
  toggleSaved,
  useSavedIds,
  reloadSaved,
} from "../../search/useSavedColleges";
import type { SavedCollege } from "../../../lib/auth/api";

interface CollegeMatchesSectionProps {
  matches: CollegeMatch[];
  loading: boolean;
}

// Display helpers — render the backend value when present, otherwise "N/A".
const fmtPercent = (v: number | null) =>
  v === null ? "N/A" : `${v.toFixed(1)}%`;
const fmtMoney = (v: number | null) =>
  v === null ? "N/A" : `$${Math.round(v).toLocaleString()}`;

export default function CollegeMatchesSection({
  matches,
  loading,
}: CollegeMatchesSectionProps) {
  const router = useRouter();

  const [view, setView] = useState<"Grid" | "List">("Grid");

  // Selected-for-comparison set, from the single shared store. Kept in sync with
  // selections made anywhere (search cards, university page, /compare page).
  const comparedIds = useCompareIds();

  // Saved-college set, from the same shared store the Saved Colleges grid reads.
  // Reading it here keeps the heart indicator in sync with saves made anywhere.
  const savedIds = useSavedIds();

  // Add/remove a matched college via the shared store, which handles the
  // localStorage mirror, the backend `/compare/selected` set, and the 5-max.
  const toggleCompare = async (match: CollegeMatch) => {
    const location =
      match.city && match.state
        ? `${match.city}, ${match.state}`
        : match.city || match.state || "";
    try {
      const result = await toggleCompareStore(
        {
          id: match.id,
          name: match.name,
          location,
          cipCode: match.cipCode || "default",
          programName: match.programTitle || undefined,
        },
        // Enriched record so the profile's comparison grid shows it instantly.
        // GET /compare/selected always reports acceptanceRate as a raw
        // fraction (e.g. 0.62); matchEngine's is already scaled to a
        // percentage, so it needs converting back for a consistent shape.
        {
          unitid: Number(match.unitid) || null,
          name: match.name,
          location,
          tuitionInState: match.tuition,
          acceptanceRate:
            match.acceptanceRate !== null ? match.acceptanceRate / 100 : null,
          addedAt: new Date().toISOString(),
        },
      );
      if (result === "removed") {
        message.info(`Removed ${match.name} from comparison.`);
      } else if (result === "added") {
        message.success(`Added ${match.name} to comparison.`);
      } else if (result === "full") {
        message.warning(
          `You can compare a maximum of ${MAX_COMPARE} colleges simultaneously.`,
        );
      }
    } catch (err) {
      console.error("Failed to update comparison selection:", err);
      message.error("Could not update your comparison list. Please try again.");
    }
  };

  // Save/unsave a matched college via the shared store. The enriched record is
  // broadcast so the Saved Colleges grid shows (or drops) the card instantly,
  // and the same call persists to the backend (/saved-colleges).
  const toggleSave = async (match: CollegeMatch) => {
    const record: SavedCollege = {
      unitid: match.unitid,
      name: match.name,
      location:
        match.city && match.state
          ? `${match.city}, ${match.state}`
          : match.city || match.state || "",
      tuitionFee: match.tuition ?? match.costOfAttendance,
      acceptanceRate: match.acceptanceRate,
      createdAt: new Date().toISOString(),
      schoolUrl: match.schoolUrl,
    };
    try {
      const nowSaved = await toggleSaved(match.unitid, record);
      if (nowSaved) {
        message.success(`Saved ${match.name} to your colleges.`);
        // The save is now persisted — reconcile the Saved Colleges grid with the
        // backend-enriched record (school URL, acceptance rate) so "Visit
        // website" works immediately instead of only after a manual refresh.
        void reloadSaved();
      } else {
        message.info(`Removed ${match.name} from saved colleges.`);
      }
    } catch (err) {
      console.error("Failed to update saved colleges:", err);
      message.error("Could not update saved colleges. Please try again.");
    }
  };

  // Open the college's full details page, mirroring the search ResultCard's
  // "View Full Details" link (route /university/:id with prefill query params).
  const goToDetails = (match: CollegeMatch) => {
    const params = new URLSearchParams({
      cip: match.cipCode || "default",
      name: match.name,
      city: match.city,
      state: match.state,
      degree: match.programTitle,
      type: match.isPrivate ? "Private" : "Public",
      admissionRate: fmtPercent(match.acceptanceRate),
      tuition: fmtMoney(match.tuition),
      avgSalary: fmtMoney(match.medianSalary1yr),
    });
    router.push(`/university/${match.id}?${params.toString()}`);
  };

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
                Matched to your target states and majors
              </span>
            </div>
          </Space>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-neutral-500 font-semibold tracking-wide uppercase">
                Realtime Engine active
              </span>
            </div>
            {matches.length > 0 && (
              <Segmented
                options={[
                  { label: "Grid", value: "Grid", icon: <AppstoreOutlined /> },
                  {
                    label: "List",
                    value: "List",
                    icon: <UnorderedListOutlined />,
                  },
                ]}
                value={view}
                onChange={(val: string) => setView(val as "Grid" | "List")}
              />
            )}
          </div>
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100 bg-linear-to-b from-white to-blue-50/10"
    >
      {/* Loading first paint */}
      {loading && matches.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : matches.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Add your target states and majors to see matched colleges."
        />
      ) : view === "List" ? (
        <div className="flex flex-col gap-3">
          {matches.map((match) => {
            const isSaved = savedIds.includes(match.unitid);
            const isCompared = comparedIds.includes(match.id);
            const location =
              match.city && match.state
                ? `${match.city}, ${match.state}`
                : match.city || match.state || "—";
            const hasTuition = match.tuition !== null;
            const costValue = hasTuition
              ? match.tuition
              : match.costOfAttendance;
            const costLabel = hasTuition ? "Tuition" : "Avg. Annual Cost";

            return (
              <div
                key={match.id}
                className="rounded-2xl border border-neutral-150 bg-white p-4 hover:shadow-sm transition-shadow"
              >
                {/* Top row: identity + quick actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      shape="square"
                      size={40}
                      style={{
                        backgroundColor: "#3b5bdb",
                        fontWeight: "bold",
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      {match.name.substring(0, 2)}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-neutral-800 leading-snug">
                          {match.name}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded-md shrink-0">
                          {match.isPrivate ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <GlobalOutlined className="text-[#3b5bdb]" />
                        {location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Tooltip
                      title={
                        isCompared
                          ? "Remove from comparison"
                          : "Add to comparison block"
                      }
                    >
                      <Button
                        type={isCompared ? "primary" : "default"}
                        ghost={isCompared}
                        icon={<SyncOutlined spin={isCompared} />}
                        onClick={() => toggleCompare(match)}
                        className={
                          isCompared
                            ? ""
                            : "border-neutral-200 text-neutral-400"
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
                        danger={isSaved}
                        icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                        onClick={() => toggleSave(match)}
                        className={
                          isSaved ? "" : "border-neutral-200 text-neutral-400"
                        }
                        size="small"
                        shape="circle"
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Matched program + degree level pills */}
                {(match.programTitle || match.degreeLevel) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {match.programTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
                        <ReadOutlined />
                        <span>{match.programTitle}</span>
                      </div>
                    )}
                    {match.degreeLevel && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                        <TrophyOutlined />
                        <span>{match.degreeLevel}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stat boxes — same tile style as Grid view, laid out in a row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs mt-3">
                  <div className="bg-emerald-50 rounded-lg px-2.5 py-2">
                    <span className="text-[10px] text-emerald-600/80 font-semibold block">
                      {costLabel}
                    </span>
                    <span className="font-bold text-emerald-700">
                      {fmtMoney(costValue)}
                      {costValue !== null && "/yr"}
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-lg px-2.5 py-2">
                    <span className="text-[10px] text-blue-600/80 font-semibold block">
                      Acceptance Rate
                    </span>
                    <span className="font-bold text-blue-700">
                      {fmtPercent(match.acceptanceRate)}
                    </span>
                  </div>
                  <div className="bg-violet-50 rounded-lg px-2.5 py-2">
                    <span className="text-[10px] text-violet-600/80 font-semibold block">
                      Graduation Rate
                    </span>
                    <span className="font-bold text-violet-700">
                      {fmtPercent(match.graduationRate)}
                    </span>
                  </div>
                  <div className="bg-amber-50 rounded-lg px-2.5 py-2">
                    <span className="text-[10px] text-amber-600/80 font-semibold block">
                      Employment Rate
                    </span>
                    <span className="font-bold text-amber-700">
                      {fmtPercent(match.employmentRate)}
                    </span>
                  </div>
                  <div className="bg-teal-50 rounded-lg px-2.5 py-2 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-teal-600/80 font-semibold block">
                      1-Yr Median Salary
                    </span>
                    <span className="font-bold text-teal-700">
                      {fmtMoney(match.medianSalary1yr)}
                      {match.medianSalary1yr !== null && "/yr"}
                    </span>
                  </div>
                </div>

                {/* Quick review link */}
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <Button
                    type="text"
                    onClick={() => goToDetails(match)}
                    className="text-xs font-semibold hover:text-blue-600 px-0 flex items-center gap-1"
                  >
                    Quick Review Detail →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {matches.map((match) => {
            const isSaved = savedIds.includes(match.unitid);
            const isCompared = comparedIds.includes(match.id);

            return (
              <Col xs={24} sm={12} md={12} lg={6} key={match.id}>
                <Card
                  variant="outlined"
                  hoverable
                  className="rounded-2xl h-full overflow-hidden border-neutral-150 shadow-xs flex flex-col justify-between"
                  styles={{
                    body: {
                      padding: "0",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    },
                  }}
                >
                  <div>
                    {/* Brand accent bar (on-theme, replaces the heavy banner) */}
                    <div className="h-1.5 bg-linear-to-r from-[#3b5bdb] to-[#2b55ff]" />

                    <div className="px-4 pt-3.5 pb-1 space-y-3">
                      {/* School name + location directly beneath it */}
                      <div>
                        <div className="flex items-start justify-between gap-2 min-h-[2.5rem]">
                          <h4 className="text-sm font-extrabold text-neutral-800 line-clamp-2 leading-snug flex-1">
                            {match.name}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded-md shrink-0 self-start">
                            {match.isPrivate ? "Private" : "Public"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 font-medium">
                          <GlobalOutlined className="text-[#3b5bdb]" />
                          {match.city && match.state
                            ? `${match.city}, ${match.state}`
                            : match.city || match.state || "—"}
                        </p>
                      </div>

                      {/* Matched program + degree level (custom pills so long
                          program names wrap inside the card instead of clipping) */}
                      {(match.programTitle || match.degreeLevel) && (
                        <div className="space-y-1.5">
                          {match.programTitle && (
                            <div className="flex items-start gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
                              <ReadOutlined className="mt-0.5 shrink-0" />
                              <span className="break-words leading-snug">
                                {match.programTitle}
                              </span>
                            </div>
                          )}
                          {match.degreeLevel && (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                              <TrophyOutlined className="shrink-0" />
                              <span>{match.degreeLevel}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stats: tuition, acceptance, graduation, employment, 1-yr salary */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(() => {
                          // Prefer listed tuition; when a program has none, fall
                          // back to the sticker price (Average Annual Cost of
                          // Attendance) so the tile isn't left as "N/A".
                          const hasTuition = match.tuition !== null;
                          const costValue = hasTuition
                            ? match.tuition
                            : match.costOfAttendance;
                          const costLabel = hasTuition
                            ? "Tuition"
                            : "Avg. Annual Cost";
                          return (
                            <div className="bg-emerald-50 rounded-lg px-2.5 py-2">
                              <span className="text-[10px] text-emerald-600/80 font-semibold block">
                                {costLabel}
                              </span>
                              <span className="font-bold text-emerald-700">
                                {fmtMoney(costValue)}
                                {costValue !== null && "/yr"}
                              </span>
                            </div>
                          );
                        })()}
                        <div className="bg-blue-50 rounded-lg px-2.5 py-2">
                          <span className="text-[10px] text-blue-600/80 font-semibold block">
                            Acceptance Rate
                          </span>
                          <span className="font-bold text-blue-700">
                            {fmtPercent(match.acceptanceRate)}
                          </span>
                        </div>
                        <div className="bg-violet-50 rounded-lg px-2.5 py-2">
                          <span className="text-[10px] text-violet-600/80 font-semibold block">
                            Graduation Rate
                          </span>
                          <span className="font-bold text-violet-700">
                            {fmtPercent(match.graduationRate)}
                          </span>
                        </div>
                        <div className="bg-amber-50 rounded-lg px-2.5 py-2">
                          <span className="text-[10px] text-amber-600/80 font-semibold block">
                            Employment Rate
                          </span>
                          <span className="font-bold text-amber-700">
                            {fmtPercent(match.employmentRate)}
                          </span>
                        </div>
                        <div className="bg-teal-50 rounded-lg px-2.5 py-2 col-span-2">
                          <span className="text-[10px] text-teal-600/80 font-semibold block">
                            1-Year Median Salary
                          </span>
                          <span className="font-bold text-teal-700">
                            {fmtMoney(match.medianSalary1yr)}
                            {match.medianSalary1yr !== null && "/yr"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: quick view + compare + save (unchanged behaviour) */}
                  <div className="px-4 pt-3 pb-4 mt-1 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <Button
                      type="text"
                      onClick={() => goToDetails(match)}
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
                          type={isCompared ? "primary" : "default"}
                          ghost={isCompared}
                          icon={<SyncOutlined spin={isCompared} />}
                          onClick={() => toggleCompare(match)}
                          className={
                            isCompared
                              ? ""
                              : "border-neutral-200 text-neutral-400"
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
                          danger={isSaved}
                          icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
                          onClick={() => toggleSave(match)}
                          className={
                            isSaved ? "" : "border-neutral-200 text-neutral-400"
                          }
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
      )}
    </Card>
  );
}
