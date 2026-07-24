/**
 * Authenticated API layer for the Firebase + backend-JWT model (auth spec §4.1,
 * §4.3, §4.8).
 *
 * Flow: Firebase owns credentials. We exchange a Firebase ID token **once** at
 * POST /auth/login for the backend's app JWT, then send that app JWT as
 * `Authorization: Bearer <appJWT>` on every protected call. On a 401 we fetch a
 * fresh Firebase ID token, re-exchange, and retry once — never a re-login screen.
 *
 * Non-negotiable: identity (uid/email) is NEVER sent in a request body for the
 * backend to trust. The backend derives identity only from the verified Firebase
 * token at /auth/login.
 */

import { auth } from "@/lib/firebase";
import { getAppJwt, setAppJwt, clearAppJwt } from "./tokenStore";

// All backend traffic goes through the Next.js proxy route, which forwards the
const PROXY_BASE = "/api/proxy";
let pendingExchangePromise: Promise<string> | null = null;

/**
 * Exchange the current Firebase user's ID token for a backend app JWT.
 * Deduplicates simultaneous calls to prevent race conditions during token exchange.
 *
 * @param forceRefresh force a fresh Firebase ID token (used on 401 so the
 *   re-exchange genuinely gets a new token rather than a cached, expired one).
 */
export async function exchangeIdToken(forceRefresh = false): Promise<string> {
  if (pendingExchangePromise && !forceRefresh) {
    return pendingExchangePromise;
  }

  const doExchange = async (): Promise<string> => {
    try {
      // Wait for Firebase to finish restoring any persisted session before
      // deciding there's no user. On a hard page refresh `auth.currentUser` is
      // momentarily null until persistence rehydrates, which otherwise made
      // early authed calls throw "no authenticated Firebase user".
      await auth.authStateReady().catch(() => {});
      const current = auth.currentUser;
      if (!current) {
        clearAppJwt();
        throw new Error(
          "Cannot exchange token: no authenticated Firebase user",
        );
      }

      const idToken = await current.getIdToken(forceRefresh);

      const res = await fetch(`${PROXY_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        clearAppJwt();
        throw new Error(`Token exchange failed (${res.status})`);
      }

      const data = (await res.json()) as { token?: string };
      if (!data.token) {
        clearAppJwt();
        throw new Error("Token exchange returned no app JWT");
      }

      setAppJwt(data.token);
      return data.token;
    } finally {
      pendingExchangePromise = null;
    }
  };

  pendingExchangePromise = doExchange();
  return pendingExchangePromise;
}

/** Shape returned by POST /auth/apple — app JWT plus the found/created user. */
export interface AppleAuthResult {
  token: string;
  user: {
    id?: number;
    display_name?: string | null;
    email?: string | null;
    profile_image?: string | null;
    role?: string;
    email_verified?: boolean;
  };
}

/**
 * Send Apple's id_token straight to the backend, which verifies it against
 * Apple's public keys, finds/creates the user, and returns the app JWT plus
 * the user record. Unlike exchangeIdToken, no Firebase session backs this —
 * Apple's token is verified entirely server-side.
 *
 * `fullName` is only ever present on the user's first-ever authorization
 * (Apple never sends it again) — the backend should use it solely when
 * creating a new user, not to overwrite an existing one.
 */
export async function exchangeAppleIdToken(
  idToken: string,
  fullName?: string,
): Promise<AppleAuthResult> {
  const res = await fetch(`${PROXY_BASE}/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken, full_name: fullName }),
  });

  if (!res.ok) {
    clearAppJwt();
    throw new Error(`Apple sign-in failed (${res.status})`);
  }

  const data = (await res.json()) as AppleAuthResult;
  if (!data.token) {
    clearAppJwt();
    throw new Error("Apple sign-in returned no app JWT");
  }

  setAppJwt(data.token);
  return data;
}

/**
 * Resolve once Firebase has restored any persisted session, returning whether a
 * user is signed in. Client stores use this to avoid firing protected calls
 * (and logging spurious token-exchange errors) when nobody is logged in.
 */
export async function hasAuthenticatedUser(): Promise<boolean> {
  try {
    await auth.authStateReady();
  } catch {
    // Older SDKs without authStateReady — fall through to a direct read.
  }
  return !!auth.currentUser;
}

/**
 * Shared authed-fetch wrapper. Every protected API call goes through this:
 * attaches the app JWT and, on a 401, re-exchanges a fresh Firebase ID token
 * once and retries the request.
 *
 * @param path backend path beginning with "/" (e.g. "/profile"). Proxied.
 */
export async function authedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = getAppJwt();
  if (!token) {
    // No app JWT in memory (e.g. first call after a page reload) — mint one.
    token = await exchangeIdToken();
  }

  const run = (jwt: string) =>
    fetch(`${PROXY_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${jwt}`,
      },
    });

  let res = await run(token);

  if (res.status === 401) {
    // App JWT expired — refresh the Firebase token, re-exchange, retry once.
    const fresh = await exchangeIdToken(true);
    res = await run(fresh);
  }

  return res;
}

async function parseJson<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    // Surface the backend's error body (forwarded verbatim by the proxy) so a
    // 500 isn't opaque — it usually carries the real cause (e.g. a DB error).
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 500);
    } catch {
      // ignore — body may be unreadable
    }
    throw new Error(
      `${action} failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return (await res.json()) as T;
}

/** GET the current user's identity/profile. /auth/me is the alias of GET /profile. */
export async function fetchMe<T = unknown>(): Promise<T> {
  const res = await authedFetch("/auth/me");
  return parseJson<T>(res, "Load account");
}

/** GET /profile — full profile JSON. */
export async function fetchProfile<T = unknown>(): Promise<T> {
  const res = await authedFetch("/profile");
  return parseJson<T>(res, "Load profile");
}

/** PATCH /profile — profile fields only. Email must NOT be included (spec §4.5). */
export async function patchProfile<T = unknown>(
  fields: Record<string, unknown>,
): Promise<T> {
  const res = await authedFetch("/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  return parseJson<T>(res, "Save profile");
}

/** Reason/feedback captured by the deactivation modal. */
export interface DeactivationPayload {
  reason_code: string;
  reason_label: string;
  other_reason?: string;
  improvement_feedback?: string;
  acknowledged: boolean;
}

/**
 * POST /account/delete — soft-deletes the account on the backend and records the
 * deactivation reason/feedback in usduser_deactivations.
 */
export async function deleteAccount(
  payload: DeactivationPayload,
): Promise<void> {
  const res = await authedFetch("/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await parseJson<{ ok: boolean }>(res, "Delete account");
}

// ---- Saved colleges -------------------------------------------------------

/** A saved college as enriched and returned by GET /saved-colleges. */
export interface SavedCollege {
  unitid: string;
  name: string;
  location: string;
  tuitionFee: number | string | null;
  acceptanceRate: number | string | null;
  createdAt: string;
  schoolUrl?: string | null;
}

/** GET /saved-colleges — the user's saved colleges, enriched by the backend. */
export async function fetchSavedColleges(): Promise<SavedCollege[]> {
  const res = await authedFetch("/saved-colleges");
  if (!res.ok) throw new Error(`Load saved colleges failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as SavedCollege[]) : [];
}

/** POST /saved-colleges — body is exactly { unitid } (no other identity sent). */
export async function saveCollege(unitid: string): Promise<void> {
  const res = await authedFetch("/saved-colleges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unitid }),
  });
  if (!res.ok) throw new Error(`Save college failed (${res.status})`);
}

/** DELETE /saved-colleges/:unitid — removes a saved college. */
export async function unsaveCollege(unitid: string): Promise<void> {
  const res = await authedFetch(
    `/saved-colleges/${encodeURIComponent(unitid)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(`Unsave college failed (${res.status})`);
}

// ---- Colleges selected for comparison -------------------------------------

/**
 * One row from GET /compare/selected, exactly as the backend sends it.
 *
 * Inconsistent percentage encoding is inherited from the underlying tables,
 * not a bug: `acceptanceRate` and `cost.debtIncomeRatio` are raw fractions
 * (e.g. 0.62), while `academics.graduationRate` and
 * `programs.repaymentSuccess` are already scaled (e.g. 31.69, meaning
 * 31.69%). Every field can be null — null means "no data", never render it
 * as 0 or "N/A" unless the value is actually 0.
 */
export interface SelectedCompareCollege {
  unitid: number | null;
  name: string | null;
  location: string | null;
  tuitionInState: number | null;
  acceptanceRate: number | null; // fraction, e.g. 0.62 — multiply by 100 for %
  addedAt: string | null;
  schoolUrl: string | null;
  schoolType: string | null;
  accreditor: string | null;
  academics: {
    satRangeLow: number | null;
    satRangeHigh: number | null;
    graduationRate: number | null; // already a percentage, e.g. 31.69
  };
  cost: {
    tuitionOutState: number | null;
    stickerPrice: number | null;
    avgDebt: number | null;
    debtIncomeRatio: number | null; // fraction
  };
  outcomes: {
    programEarnings: number | null;
    avgSalary: number | null;
    roi20Yr: number | null;
  };
  programs: {
    studentFacultyRatio: string | null; // e.g. "15:1"
    repaymentSuccess: number | null; // already a percentage, e.g. 36
    popularFields: {
      fieldName: string;
      percentage: number;
      programCount: number;
    }[];
    degreeLevels: {
      level: string;
      totalPrograms: number;
      topTitles: string[];
    }[];
    // Only set when the `?program=` query matched a program at this college.
    selectedProgram: {
      title: string;
      cipCode: string | null;
      degreeLevelCategory: string | null;
      credentialLevel: number | null;
      earnings: number | null;
    } | null;
  };
}

/**
 * The subset of a SelectedCompareCollege that callers can build locally
 * before the backend confirms a selection (e.g. from a search-card click) —
 * just enough to render the profile's "selected for comparison" grid
 * instantly, without waiting on a GET /compare/selected refetch.
 */
export type CompareSummary = Pick<
  SelectedCompareCollege,
  "unitid" | "name" | "location" | "tuitionInState" | "acceptanceRate" | "addedAt"
>;

/**
 * GET /compare/selected — the user's comparison set, enriched by the backend.
 * Pass `programs` to also resolve `programs.selectedProgram` for whichever
 * program in the list matches each college in the set — one request
 * resolves every compared college's program in a single round trip, rather
 * than one request per distinct program.
 */
export async function fetchCompareSelected(
  programs?: string[],
): Promise<SelectedCompareCollege[]> {
  const query = programs?.length
    ? `?programs=${encodeURIComponent(programs.join(","))}`
    : "";
  const res = await authedFetch(`/compare/selected${query}`);
  if (!res.ok) throw new Error(`Load comparison set failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as SelectedCompareCollege[]) : [];
}

/** POST /compare/selected — body is exactly { unitid }. */
export async function addCompareSelected(unitid: string): Promise<void> {
  const res = await authedFetch("/compare/selected", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unitid }),
  });
  if (!res.ok) throw new Error(`Select for comparison failed (${res.status})`);
}

/** DELETE /compare/selected/:unitid — removes a college from the comparison set. */
export async function removeCompareSelected(unitid: string): Promise<void> {
  const res = await authedFetch(
    `/compare/selected/${encodeURIComponent(unitid)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(`Deselect comparison failed (${res.status})`);
}

// ---- Compare page's per-program matrix -------------------------------------
//
// The /compare page can hold the same unitid more than once (one entry per
// program picked for that college). That's distinct from — and layered on
// top of — the bare-unitid "selected for comparison" bucket above, which
// every other surface (search cards, nav badge, Intelligent Matches) reads.
// Previously this per-program detail (cipCode/programName/credentialLevel)
// only lived in localStorage, so it silently disappeared on a new
// device/session or whenever storage was cleared. These two calls persist it
// server-side instead, keyed by user, so it survives a fresh login.

/** One program-specific row in the compare matrix. */
export interface CompareMatrixEntry {
  unitid: string;
  cipCode: string | null;
  credentialLevel: string | null;
  programName: string | null;
  credentialTitle: string | null;
}

/** GET /compare/matrix — the signed-in user's persisted compare-page matrix. */
export async function fetchCompareMatrix(): Promise<CompareMatrixEntry[]> {
  const res = await authedFetch("/compare/matrix");
  if (!res.ok) throw new Error(`Load comparison matrix failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as CompareMatrixEntry[]) : [];
}

/**
 * PUT /compare/matrix — replaces the user's entire compare-page matrix with
 * `entries`. Whole-list replace (not incremental add/remove) to match how
 * the matrix is already maintained client-side (see writeMatrixEntries).
 */
export async function saveCompareMatrix(
  entries: CompareMatrixEntry[],
): Promise<void> {
  const res = await authedFetch("/compare/matrix", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) throw new Error(`Save comparison matrix failed (${res.status})`);
}

// ---- Generated reports ------------------------------------------------------

/** A college entry as returned inside a report's `colleges` array. */
export interface ReportCollege {
  unitid: number;
  name: string;
}

/** A single report as returned by GET /report/:reportId (and the /report/generate response). */
export interface ReportDetail {
  reportId: string;
  createdAt: string;
  colleges: ReportCollege[];
  downloadUrl: string;
  expiresAt: string;
}

/** One row of the paginated GET /report list. */
export interface ReportSummary {
  reportId: string;
  createdAt: string;
  colleges: ReportCollege[];
}

export interface PaginatedReports {
  reports: ReportSummary[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/** GET /report?page=&limit= — the current user's report history (router mounted at /report, singular). */
export async function fetchReports(
  page = 1,
  limit = 10,
): Promise<PaginatedReports> {
  const res = await authedFetch(`/report?page=${page}&limit=${limit}`);
  return parseJson<PaginatedReports>(res, "Load reports");
}

/** GET /report/:reportId — a single report's metadata and a fresh signed download URL. */
export async function fetchReport(reportId: string): Promise<ReportDetail> {
  const res = await authedFetch(`/report/${encodeURIComponent(reportId)}`);
  if (res.status === 404) {
    throw new ReportNotFoundError(reportId);
  }
  return parseJson<ReportDetail>(res, "Load report");
}

export class ReportNotFoundError extends Error {
  constructor(reportId: string) {
    super(`Report ${reportId} not found`);
    this.name = "ReportNotFoundError";
  }
}
