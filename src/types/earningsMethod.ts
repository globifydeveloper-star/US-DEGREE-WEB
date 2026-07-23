// Mirrors the backend's per-year earnings fill-method enum (no shared types
// package exists between frontend/backend in this repo, so this is a local
// mirror — keep in sync with the API contract if the backend enum changes).
export type EarningsFillMethod =
  | "user_reported"
  | "interpolated"
  | "extrapolated"
  | "low_confidence"
  | "skipped_future"
  | "skipped_no_anchor";

export const EARNINGS_METHOD_COPY: Record<EarningsFillMethod, string> = {
  user_reported:
    "This figure comes directly from reported federal earnings data.",
  interpolated:
    "This figure is estimated based on the trend between two known data points for this program. It's our most reliable type of estimate.",
  extrapolated:
    "This figure is estimated by projecting from the nearest available data point for this program.",
  low_confidence:
    "This figure is a rough estimate based on limited data. Treat it as approximate.",
  skipped_future:
    "Not yet available — this class hasn't reached this many years post-graduation.",
  skipped_no_anchor:
    "Not yet published by the data source — check back after the next data update.",
};

// Short label shown on the pill badge variant.
export const EARNINGS_METHOD_LABEL: Record<EarningsFillMethod, string> = {
  user_reported: "Reported",
  interpolated: "Estimated",
  extrapolated: "Estimated",
  low_confidence: "Rough Estimate",
  skipped_future: "Not Yet Available",
  skipped_no_anchor: "Not Available",
};

// Methods where the underlying figure is null — the card should show a muted
// placeholder instead of a dollar amount, and read as a different state than
// "here's a number, with a confidence level."
export const EARNINGS_SKIPPED_METHODS: ReadonlySet<EarningsFillMethod> =
  new Set(["skipped_future", "skipped_no_anchor"]);

// One horizon (year_1/5/10) resolved independently against whichever
// grad_cohort has the best available data for that specific horizon — the
// three metrics for the same program can legitimately come from different
// cohorts. `cohort` is the grad_cohort year (e.g. "2016") that produced
// `value`/`method`, or null when the backend has no cohort to attribute
// (e.g. skipped_no_anchor).
export interface ResolvedEarningsMetric {
  value: number | null;
  method: EarningsFillMethod | null;
  cohort: string | null;
}

// Tooltip copy for a method, with the cohort folded in when one is known.
// skipped_no_anchor has no meaningful cohort to attribute, so it's left off
// even when the backend happens to send one.
export function describeEarningsMethod(
  method: EarningsFillMethod,
  cohort?: string | null,
): string {
  const base = EARNINGS_METHOD_COPY[method];
  if (!cohort || method === "skipped_no_anchor") return base;
  return `${base} Based on the ${cohort} LEHD Available Report.`;
}
