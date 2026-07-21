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
    "This data isn't available yet — it covers a time period that hasn't happened for this group of students.",
  skipped_no_anchor: "No earnings data is available for this program.",
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
