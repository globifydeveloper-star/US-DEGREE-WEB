"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Segmented,
  List,
  Empty,
  Row,
  Col,
  Space,
  Spin,
  message,
} from "antd";
import {
  GlobalOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  HeartFilled,
} from "@ant-design/icons";
import {
  fetchSavedColleges,
  unsaveCollege,
  authedFetch,
  SavedCollege,
} from "../../../lib/auth/api";
import {
  SAVED_EVENT,
  reloadSaved,
  type SavedChangeDetail,
} from "../../search/useSavedColleges";

interface SavedCollegesSectionProps {
  view: "Grid" | "List";
  onViewChange: (view: "Grid" | "List") => void;
}

// Formats the Average Annual Cost of Attendance shown on each saved card.
function formatTuition(value: SavedCollege["tuitionFee"]): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isNaN(n)
    ? String(value)
    : `$${Math.round(n).toLocaleString()}/yr`;
}

/**
 * Replace each saved card's cost figure with the Average Annual Cost of
 * Attendance (sticker_price_by_api) from GET /tuition/:unitid — the same value
 * the College Matches section and the Tuition & Costs tab show. Falls back to
 * whatever the saved record already carried when the lookup has no sticker
 * price. Stored back on `tuitionFee` since that's the card's cost field.
 */
async function enrichWithAnnualCost(
  list: SavedCollege[],
): Promise<SavedCollege[]> {
  if (list.length === 0) return list;

  const fills = new Map<string, number>();
  await Promise.all(
    list.map(async (c) => {
      try {
        const res = await authedFetch(`/tuition/${c.unitid}`);
        if (!res.ok) return;
        const data = await res.json();
        const sticker = data?.tuition?.sticker_price_by_api;
        const n = sticker == null ? NaN : Number(sticker);
        if (!Number.isNaN(n)) fills.set(String(c.unitid), n);
      } catch {
        // Best-effort — keep the record's existing cost if the lookup fails.
      }
    }),
  );

  if (fills.size === 0) return list;
  return list.map((c) =>
    fills.has(String(c.unitid))
      ? { ...c, tuitionFee: fills.get(String(c.unitid))! }
      : c,
  );
}

function formatRate(value: SavedCollege["acceptanceRate"]): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  // The backend returns admission rates as a 0–1 fraction (e.g. 0.7582); scale
  // those up so we render "75.8%" instead of "0.7582%". Values already on a
  // 0–100 scale are left as-is.
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(1)}%`;
}

// Normalize the school URL to an absolute https link, or null if missing/empty
// (so we never render a dead link or fabricate a URL).
function normalizeUrl(url: SavedCollege["schoolUrl"]): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function SavedCollegesSection({
  view,
  onViewChange,
}: SavedCollegesSectionProps) {
  const [colleges, setColleges] = useState<SavedCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchSavedColleges();
      setColleges(list); // paint immediately
      const enriched = await enrichWithAnnualCost(list);
      if (enriched !== list) setColleges(enriched);
    } catch (err) {
      console.error("Failed to load saved colleges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await fetchSavedColleges();
        if (active) setColleges(list);
        const enriched = await enrichWithAnnualCost(list);
        if (active && enriched !== list) setColleges(enriched);
      } catch (err) {
        console.error("Failed to load saved colleges:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    // Stay in sync when a card elsewhere toggles save state this session. When
    // the event carries a detail payload we update in place for an instant,
    // delay-free result; otherwise we fall back to a full reload.
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SavedChangeDetail | undefined>).detail;
      if (detail?.action === "added") {
        const rec = detail.record;
        setColleges((prev) =>
          prev.some((c) => String(c.unitid) === String(rec.unitid))
            ? prev
            : [rec, ...prev],
        );
      } else if (detail?.action === "removed") {
        setColleges((prev) =>
          prev.filter((c) => String(c.unitid) !== String(detail.unitid)),
        );
      } else {
        load();
      }
    };
    window.addEventListener(SAVED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(SAVED_EVENT, handler);
    };
  }, [load]);

  const handleRemove = async (unitid: string, name: string) => {
    setRemoving(unitid);
    try {
      await unsaveCollege(unitid);
      setColleges((prev) =>
        prev.filter((c) => String(c.unitid) !== String(unitid)),
      );
      await reloadSaved(); // keep the search-card store in sync
      message.success(`${name} removed from your saved list.`);
    } catch (err) {
      console.error("Failed to remove saved college:", err);
      message.error("Could not remove this college. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Card
      id="saved_colleges_section"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-2">
          <Space>
            <HeartFilled className="text-red-500" />
            <span className="font-bold">
              Saved Colleges ({colleges.length})
            </span>
          </Space>

          {/* Grid/List segment switch */}
          <Segmented
            options={[
              { label: "Grid", value: "Grid", icon: <AppstoreOutlined /> },
              { label: "List", value: "List", icon: <UnorderedListOutlined /> },
            ]}
            value={view}
            onChange={(val: string) => onViewChange(val as "Grid" | "List")}
          />
        </div>
      }
      variant="borderless"
      className="shadow-md rounded-2xl border border-neutral-100"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : colleges.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-sm font-semibold text-neutral-500">
              No saved colleges yet.
            </span>
          }
        />
      ) : view === "Grid" ? (
        /* Grid View mode matching college style */
        <Row gutter={[20, 20]}>
          {colleges.map((uni) => {
            const websiteUrl = normalizeUrl(uni.schoolUrl);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={uni.unitid}>
                <Card
                  hoverable
                  variant="outlined"
                  className="overflow-hidden rounded-2xl h-full border-neutral-150 shadow-xs flex flex-col justify-between"
                  styles={{
                    body: {
                      padding: "16px",
                      flex: "1",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    },
                  }}
                >
                  <div>
                    <h4 className="text-sm font-extrabold text-neutral-800 tracking-tight leading-snug line-clamp-1">
                      {uni.name}
                    </h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <GlobalOutlined />
                      {uni.location}
                    </p>

                    <div className="bg-neutral-50 rounded-xl p-2.5 mt-3 space-y-1.5 text-xs text-neutral-600">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">
                          Avg. Annual Cost:
                        </span>
                        <span className="font-semibold text-neutral-700">
                          {formatTuition(uni.tuitionFee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">
                          Acceptance Rate:
                        </span>
                        <span className="font-semibold text-neutral-700">
                          {formatRate(uni.acceptanceRate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-neutral-100 w-full">
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      disabled={!websiteUrl}
                      href={websiteUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flex: "1", borderRadius: "6px" }}
                    >
                      Visit website
                    </Button>
                    <Button
                      danger
                      type="text"
                      size="small"
                      loading={removing === String(uni.unitid)}
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(uni.unitid, uni.name)}
                      style={{ borderRadius: "6px" }}
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* List View mode matching standard AntD List */
        <List
          itemLayout="horizontal"
          dataSource={colleges}
          renderItem={(uni: SavedCollege) => {
            const websiteUrl = normalizeUrl(uni.schoolUrl);
            return (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key="view"
                    disabled={!websiteUrl}
                    href={websiteUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    Visit website
                  </Button>,
                  <Button
                    type="text"
                    danger
                    key="remove"
                    loading={removing === String(uni.unitid)}
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(uni.unitid, uni.name)}
                  >
                    Remove From list
                  </Button>,
                ]}
                className="hover:bg-neutral-50 px-4 rounded-xl border-b border-neutral-100 transition-colors"
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: "#1890ff", fontWeight: "bold" }}
                    >
                      {uni.name.substring(0, 2)}
                    </Avatar>
                  }
                  title={
                    <span className="font-extrabold text-neutral-800">
                      {uni.name}
                    </span>
                  }
                  description={
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <GlobalOutlined />
                        {uni.location}
                      </span>
                      <span>•</span>
                      <span>
                        Avg. Annual Cost:{" "}
                        <b className="text-neutral-700">
                          {formatTuition(uni.tuitionFee)}
                        </b>
                      </span>
                      <span>•</span>
                      <span>
                        Acceptance Rate:{" "}
                        <b className="text-neutral-700">
                          {formatRate(uni.acceptanceRate)}
                        </b>
                      </span>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}
