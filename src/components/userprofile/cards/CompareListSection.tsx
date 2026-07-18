"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Empty, Row, Col, Space, Spin, message } from "antd";
import {
  SyncOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import {
  fetchCompareSelected,
  SelectedCompareCollege,
} from "../../../lib/auth/api";
import {
  COMPARE_SELECTED_EVENT,
  removeFromCompare,
  clearCompare,
  type CompareChangeDetail,
} from "../../search/useCompareSelected";
import {
  parseEntryId,
  mergeCompareEntryIds,
} from "../../compare/useCompareColleges";
import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";

// Date ONLY, app locale (en-US), e.g. "Jun 19, 2026". Returns null for
// missing/invalid values so the line can be omitted (never "Invalid Date").
function formatAddedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Enriched values come straight from GET /compare/selected — never hardcoded.
function formatTuition(
  value: SelectedCompareCollege["tuitionInState"],
): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isNaN(n)
    ? String(value)
    : `$${Math.round(n).toLocaleString()}/yr`;
}

function formatRate(value: SelectedCompareCollege["acceptanceRate"]): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  // Backend admission rates arrive as a 0–1 fraction (e.g. 0.7582); scale those
  // up to render "75.8%". Values already on a 0–100 scale are left as-is.
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(1)}%`;
}

const BADGE_CLASS =
  "inline-flex items-center gap-1 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap max-w-full";

const PROGRAM_BADGE_CLASS =
  "inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap max-w-full";

interface LocalProgramInfo {
  programName: string;
  credentialTitle: string;
  cipCode: string;
}

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function readEntryPrograms(): Record<
  string,
  { programName: string; credentialTitle: string }
> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(localStorage.getItem(ENTRY_PROGRAMS_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/**
 * A college shown here can have more than one program attached — the
 * /compare page's own matrix lets the same college be compared under
 * several programs. That matrix is local-only (the backend's
 * /compare/selected is college-level), so we read it directly and group by
 * unitid, keyed off the same `compare_matrix_entries` / `compare_entry_programs`
 * localStorage the compare page and CompareDeck already maintain.
 */
function readLocalProgramsByUnitid(): Record<string, LocalProgramInfo[]> {
  const matrix = readJsonArray(MATRIX_ENTRIES_KEY);
  const programsMap = readEntryPrograms();
  const grouped: Record<string, LocalProgramInfo[]> = {};

  matrix.forEach((entryId) => {
    const { unitid, cipCode } = parseEntryId(entryId);
    if (entryId === unitid) return; // bare entry — no program attached
    const info = programsMap[entryId];
    if (!info) return;
    const list = grouped[unitid] || [];
    list.push({
      programName: info.programName,
      credentialTitle: info.credentialTitle,
      cipCode,
    });
    grouped[unitid] = list;
  });

  return grouped;
}

export default function CompareListSection() {
  const router = useRouter();
  const [items, setItems] = useState<SelectedCompareCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [programsByUnitid, setProgramsByUnitid] = useState<
    Record<string, LocalProgramInfo[]>
  >({});

  const load = useCallback(async () => {
    try {
      const list = await fetchCompareSelected();
      setItems(list);
    } catch (err) {
      console.error("Failed to load comparison set:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocalPrograms = useCallback(() => {
    setProgramsByUnitid(readLocalProgramsByUnitid());
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchCompareSelected();
        if (active) setItems(list);
      } catch (err) {
        console.error("Failed to load comparison set:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    // Deferred (not called synchronously in the effect body) so its setState
    // isn't flagged as a same-tick cascading render.
    queueMicrotask(() => refreshLocalPrograms());
    // Reflect selections toggled from elsewhere (e.g. a ResultCard or the
    // college-matches grid) this session. A detail payload lets us update in
    // place for an instant, delay-free result; otherwise we reload.
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CompareChangeDetail | undefined>).detail;
      if (detail?.action === "added") {
        const rec = detail.record;
        setItems((prev) =>
          prev.some((c) => String(c.unitid) === String(rec.unitid))
            ? prev
            : [...prev, rec],
        );
      } else if (detail?.action === "removed") {
        setItems((prev) =>
          prev.filter((c) => String(c.unitid) !== String(detail.unitid)),
        );
      } else if (detail?.action === "cleared") {
        setItems([]);
      } else {
        load();
      }
    };
    window.addEventListener(COMPARE_SELECTED_EVENT, handler);
    window.addEventListener(MATRIX_UPDATED_EVENT, refreshLocalPrograms);
    return () => {
      active = false;
      window.removeEventListener(COMPARE_SELECTED_EVENT, handler);
      window.removeEventListener(MATRIX_UPDATED_EVENT, refreshLocalPrograms);
    };
  }, [load, refreshLocalPrograms]);

  const handleRemove = async (unitid: string, name: string) => {
    setBusyId(unitid);
    try {
      // Single source of truth: the store updates the backend + localStorage
      // mirror and notifies the Navbar badge / matrix page / search cards.
      await removeFromCompare(unitid);

      // A college can carry more than one /compare-page matrix entry (one
      // per program) — drop all of them too, so the nav badge and the
      // compare page's own matrix don't retain orphans for a college that
      // was just fully removed here.
      const matrix = readJsonArray(MATRIX_ENTRIES_KEY);
      const remainingMatrix = matrix.filter(
        (entryId) => parseEntryId(entryId).unitid !== unitid,
      );
      if (remainingMatrix.length !== matrix.length) {
        localStorage.setItem(
          MATRIX_ENTRIES_KEY,
          JSON.stringify(remainingMatrix),
        );
        const programsMap = readEntryPrograms();
        matrix.forEach((entryId) => {
          if (parseEntryId(entryId).unitid === unitid) {
            delete programsMap[entryId];
          }
        });
        localStorage.setItem(ENTRY_PROGRAMS_KEY, JSON.stringify(programsMap));
        window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));
      }

      setItems((prev) =>
        prev.filter((c) => String(c.unitid) !== String(unitid)),
      );
      message.info(`Removed ${name} from comparison.`);
    } catch (err) {
      console.error("Failed to remove from comparison:", err);
      message.error("Could not remove this college. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      // Clear the /compare page's own matrix (per-program entries + the nav
      // badge's count source) alongside the shared college-level store below
      // — otherwise this "clear everything" action would leave orphaned
      // program entries behind, and the nav badge / compare page would still
      // show a nonzero count.
      localStorage.setItem(MATRIX_ENTRIES_KEY, "[]");
      localStorage.removeItem(ENTRY_PROGRAMS_KEY);
      window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));

      await clearCompare();
      setItems([]);
      message.info("Comparison bucket cleared successfully.");
    } catch (err) {
      console.error("Failed to clear comparison set:", err);
      message.error("Could not clear the comparison list. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  // Hand the queued entries to the live /compare page (same URL contract
  // CompareDeck uses) — mergeCompareEntryIds() carries over every
  // program-specific entry a college has, not just one id per college.
  const handleCompareNow = () => {
    const ids = mergeCompareEntryIds();
    if (ids.length < 2) return;
    router.push(`/compare?ids=${ids.join(",")}`);
  };

  return (
    <Card
      id="colleges_compare_section"
      title={
        <div className="flex items-center justify-between gap-2 py-1">
          <Space>
            <SyncOutlined className="text-blue-500" />
            <span className="font-bold">Colleges Selected for Comparison</span>
          </Space>
          {items.length > 0 && (
            <Button
              danger
              type="text"
              size="small"
              loading={clearing}
              onClick={handleClearAll}
            >
              Clear Compare Bucket
            </Button>
          )}
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100 bg-linear-to-b from-white to-neutral-50/20"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-sm font-semibold text-neutral-500">
              No colleges selected for comparison.
            </span>
          }
        />
      ) : (
        <div className="space-y-6">
          <Row gutter={[16, 16]}>
            {items.map((c) => {
              const addedAtText = formatAddedAt(c.addedAt);
              return (
                <Col xs={24} sm={12} lg={8} key={c.unitid}>
                  <Card
                    size="small"
                    variant="outlined"
                    className="border-neutral-200 shadow-xxs rounded-xl relative h-full"
                  >
                    <button
                      aria-label={`Remove ${c.name} from comparison`}
                      disabled={busyId === String(c.unitid)}
                      className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full h-5 w-5 flex items-center justify-center transition-colors disabled:opacity-40"
                      onClick={() => handleRemove(c.unitid, c.name)}
                    >
                      ×
                    </button>

                    <div className="space-y-2 pr-6 pt-1">
                      <h5 className="text-sm font-bold text-neutral-800 break-words line-clamp-2">
                        {c.name}
                      </h5>

                      {/* Badges wrap cleanly at any width — no overflow. */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={BADGE_CLASS}>
                          <EnvironmentOutlined />
                          {c.location || "Location N/A"}
                        </span>
                        <span className={BADGE_CLASS}>
                          <DollarOutlined />
                          In-state: {formatTuition(c.tuitionInState)}
                        </span>
                        <span className={BADGE_CLASS}>
                          <PercentageOutlined />
                          Acceptance: {formatRate(c.acceptanceRate)}
                        </span>
                        {(programsByUnitid[String(c.unitid)] || []).map(
                          (p, i) => (
                            <span key={i} className={PROGRAM_BADGE_CLASS}>
                              {p.programName}
                              {p.credentialTitle ? ` • ${p.credentialTitle}` : ""}
                              {p.cipCode && p.cipCode !== "default"
                                ? ` (CIP ${p.cipCode})`
                                : ""}
                            </span>
                          ),
                        )}
                      </div>

                      {addedAtText && (
                        <p className="text-[11px] text-neutral-400 leading-snug break-words">
                          You added this college for comparison at {addedAtText}
                        </p>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
            <span className="text-xs text-neutral-600 leading-relaxed font-semibold">
              🎓 Evaluate financial and selectivity metrics side by side in the
              comparison matrix tool.
            </span>
            <Button
              type="primary"
              disabled={items.length < 2}
              onClick={handleCompareNow}
              style={{ borderRadius: "8px" }}
              className="shrink-0"
            >
              Compare Now ({items.length})
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
