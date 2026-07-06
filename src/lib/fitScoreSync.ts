/**
 * Shared client-side store for the "fit score" academic inputs (GPA + SAT).
 *
 * These two numbers are entered in two places — the "Find your fit score" box on
 * each search result card, and the student profile's Academic card — and must
 * stay in sync between them. They live in localStorage (so they persist across
 * pages) and a `fit-score-updated` window event is broadcast on every change so
 * any mounted consumer can react live. The profile additionally mirrors them to
 * the backend so they survive a reload; see ProfileDashboard.
 */

export const FIT_GPA_KEY = "fit_score_gpa";
export const FIT_SAT_KEY = "fit_score_sat";
export const FIT_SCORE_EVENT = "fit-score-updated";

/**
 * Records that a signed-out user tried to open a result card's "Find your fit
 * score" box. Set just before bouncing them to the login page; after they log
 * in we send them back to `url` and the matching card (`cardId`) auto-opens the
 * Calculate Your Fit Score popup.
 */
export const FIT_LOGIN_INTENT_KEY = "fit_score_login_intent";

export interface FitLoginIntent {
  /** Full path+query to return to after login (the search page they were on). */
  url: string;
  /** The result card's id, so only that card re-opens its popup. */
  cardId: string;
}

export interface FitStats {
  gpa: number | null;
  sat: number | null;
}

/** Read the current fit stats from localStorage (null when absent/blank). */
export function readFitStats(): FitStats {
  if (typeof window === "undefined") return { gpa: null, sat: null };
  const gRaw = localStorage.getItem(FIT_GPA_KEY);
  const sRaw = localStorage.getItem(FIT_SAT_KEY);
  const gpa = gRaw != null && gRaw !== "" ? Number(gRaw) : NaN;
  const sat = sRaw != null && sRaw !== "" ? Number(sRaw) : NaN;
  return {
    gpa: Number.isFinite(gpa) ? gpa : null,
    sat: Number.isFinite(sat) ? sat : null,
  };
}

/**
 * Persist the fit stats to localStorage and broadcast the change so every open
 * result card and the profile update in real time. A `null` value clears that
 * key. Pass `silent` to skip the broadcast (used when reacting to an event to
 * avoid a feedback loop).
 */
export function writeFitStats(
  gpa: number | null,
  sat: number | null,
  silent = false,
): void {
  if (typeof window === "undefined") return;
  if (gpa != null) localStorage.setItem(FIT_GPA_KEY, String(gpa));
  else localStorage.removeItem(FIT_GPA_KEY);
  if (sat != null) localStorage.setItem(FIT_SAT_KEY, String(sat));
  else localStorage.removeItem(FIT_SAT_KEY);
  if (!silent) window.dispatchEvent(new Event(FIT_SCORE_EVENT));
}

/** True when a GPA has been entered (the gate for showing a computed fit). */
export function hasFitStats(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FIT_GPA_KEY) != null;
}
