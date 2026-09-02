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
import { getCredentialLevelInfo } from "@/constants/credentialLevel";
import type { SearchResult } from "@/types/search-details";

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
  // No signed-in Firebase user (e.g. an anonymous visitor on a now-public
  // page like /compare) — fall back to a plain, unauthenticated request
  // instead of throwing, so public/browsable endpoints still work. Callers
  // hitting a genuinely user-scoped endpoint just see a non-ok response and
  // handle it themselves (see hasAuthenticatedUser() gates elsewhere).
  if (!(await hasAuthenticatedUser())) {
    return fetch(`${PROXY_BASE}${path}`, options);
  }

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
  /** CIP code of the program the college was saved under, if any (disambiguates
   * which program/credential this save refers to when linking to its details
   * page). Absent for a plain college-level save. */
  cipCode?: string | null;
  programName?: string | null;
  credentialLevel?: string | number | null;
  credentialTitle?: string | null;
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

// ---- Reversed compare-bar lookups: Credential -> Program -> College -------
//
// GET /programs and GET /programs/:cip_code/schools both require a signed-in
// session on the backend, which broke these once /compare went public (401
// for anonymous visitors). GET /search does the same underlying lookup and
// is already public (it powers the whole /search results page for anonymous
// visitors), so both helpers below are built on it instead — deduped
// client-side down to the distinct-program / distinct-school shape the
// compare search bar needs.

/** One row from GET /programs — a distinct program offered at a credential level. */
export interface ProgramByCredential {
  title: string;
  cip_code: string;
  credential_level: number;
  credential_title: string;
}

/**
 * Distinct programs (by cip_code) offered at `credentialLevel` across every
 * school, optionally keyword-searched by title, derived from GET /search.
 * Powers the compare page's own search bar's "Program" step once a
 * credential level has been chosen.
 */
export async function fetchProgramsByCredential(
  credentialLevel: number,
  q?: string,
  limit = 20,
): Promise<ProgramByCredential[]> {
  const credentialTitle = getCredentialLevelInfo(credentialLevel)?.title;
  if (!credentialTitle) return [];

  const params = new URLSearchParams();
  params.set("credential_title", credentialTitle);
  if (q) params.set("title", q);
  const res = await fetch(`${PROXY_BASE}/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Load programs failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const byCip = new Map<string, ProgramByCredential>();
  for (const row of data as SearchResult[]) {
    if (row.credential_level !== credentialLevel) continue;
    if (!row.cip_code || byCip.has(row.cip_code)) continue;
    byCip.set(row.cip_code, {
      title: row.program_title,
      cip_code: row.cip_code,
      credential_level: credentialLevel,
      credential_title: row.credential_title,
    });
    if (byCip.size >= limit) break;
  }
  return Array.from(byCip.values());
}

/** One row from GET /programs/:cip_code/schools. */
export interface SchoolForProgram {
  unitid: number;
  school_name: string;
  city: string | null;
  state: string | null;
}

/**
 * Distinct schools (by unitid) offering `cipCode` at `credentialLevel`,
 * optionally keyword-searched by school name, derived from GET /search
 * (narrowed server-side by `programTitle` first, then filtered client-side
 * to the exact cip_code — `/search`'s title match is fuzzy). Powers the
 * compare page's own search bar's "College" step once a program has been
 * chosen.
 */
export async function fetchSchoolsForProgram(
  cipCode: string,
  credentialLevel: number,
  programTitle: string,
  q?: string,
  limit = 20,
): Promise<SchoolForProgram[]> {
  const credentialTitle = getCredentialLevelInfo(credentialLevel)?.title;
  if (!credentialTitle) return [];

  const params = new URLSearchParams();
  params.set("credential_title", credentialTitle);
  if (programTitle) params.set("title", programTitle);
  const res = await fetch(`${PROXY_BASE}/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Load schools for program failed (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const qLower = q ? q.trim().toLowerCase() : "";
  const byUnitid = new Map<string, SchoolForProgram>();
  for (const row of data as SearchResult[]) {
    if (String(row.cip_code) !== cipCode) continue;
    if (row.credential_level !== credentialLevel) continue;
    if (qLower && (!row.school_name || !row.school_name.toLowerCase().includes(qLower))) continue;
    const key = String(row.unitid);
    if (byUnitid.has(key)) continue;
    byUnitid.set(key, {
      unitid: Number(row.unitid),
      school_name: row.school_name,
      city: row.city,
      state: row.state,
    });
    if (byUnitid.size >= limit) break;
  }
  return Array.from(byUnitid.values());
}

// ---- Colleges selected for comparison -------------------------------------

/**
 * A salary figure resolved via the backend's getEarningsForProgram() — one
 * horizon (e.g. "year_5"), whichever grad_cohort has the best available data
 * for it. Sent instead of a bare number whenever a specific program was
 * matched (see programs.selectedProgram below); use resolveSalaryValue() to
 * get a plain number out of either shape.
 */
export interface EarningsAvgSalaryResolved {
  value: number | null;
  cohort: string | null;
  basis: string | null;
  basis_is_estimated: boolean;
}

/**
 * One row from GET /compare/matrix/details, exactly as the backend sends it.
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
    // A bare school-wide average, OR the getEarningsForProgram() resolution
    // when a specific program was matched — see EarningsAvgSalaryResolved.
    avgSalary: number | EarningsAvgSalaryResolved | null;
    roi20Yr: number | null;
  };
  students: {
    size: number | null; // total enrollment
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
    // Set whenever this entry's own cipCode/credentialLevel matched a
    // program at this college (see GET /compare/matrix/details).
    selectedProgram: {
      title: string;
      cipCode: string | null;
      degreeLevelCategory: string | null;
      credentialLevel: number | null;
      earnings: number | EarningsAvgSalaryResolved | null;
    } | null;
  };
}

/** Unwraps either shape outcomes.avgSalary / selectedProgram.earnings can take. */
export function resolveSalaryValue(
  v: number | EarningsAvgSalaryResolved | null | undefined,
): number | null {
  if (v === null || v === undefined) return null;
  return typeof v === "number" ? v : v.value;
}

// ---- Compare page's per-program matrix -------------------------------------
//
// The single source of truth for "colleges queued for comparison" across the
// whole app (search cards, Intelligent Matches, the university page, and the
// /compare page's own filter) — see compareMatrixStore.ts. The same unitid
// can appear more than once, one entry per program picked for that college.

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
 * `entries`. Whole-list replace; only safe for single-writer operations like
 * clearing the matrix entirely. Anything that adds/removes one entry at a
 * time should use addCompareMatrixEntry/removeCompareMatrixEntry instead,
 * which are atomic against concurrent callers.
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

/** Thrown by addCompareMatrixEntry when the 5-entry cap is already hit. */
export class CompareLimitReachedError extends Error {
  constructor(message = "Compare limit reached") {
    super(message);
    this.name = "CompareLimitReachedError";
  }
}

/**
 * POST /compare/matrix/entry — atomically upserts one compare-matrix entry
 * (dedupe key: unitid + cipCode + credentialLevel). Safe for multiple
 * independent UI surfaces (search cards, Intelligent Matches, university
 * page, the /compare page's own filter) to call concurrently, unlike the
 * whole-list saveCompareMatrix. Returns the caller's full updated matrix.
 */
export async function addCompareMatrixEntry(entry: {
  unitid: string;
  cipCode?: string | null;
  credentialLevel?: string | number | null;
  programName?: string | null;
  credentialTitle?: string | null;
}): Promise<CompareMatrixEntry[]> {
  const res = await authedFetch("/compare/matrix/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (res.status === 409) throw new CompareLimitReachedError();
  if (!res.ok) throw new Error(`Add compare matrix entry failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as CompareMatrixEntry[]) : [];
}

/**
 * DELETE /compare/matrix/entry/:unitid — removes every entry for a college
 * (no program given), or DELETE /compare/matrix/entry/:unitid/:cipCode/
 * :credentialLevel — removes one specific program entry. Returns the
 * caller's full updated matrix.
 */
export async function removeCompareMatrixEntry(
  unitid: string,
  program?: { cipCode: string; credentialLevel?: string | number },
): Promise<CompareMatrixEntry[]> {
  const path = program
    ? `/compare/matrix/entry/${encodeURIComponent(unitid)}/${encodeURIComponent(program.cipCode)}/${encodeURIComponent(String(program.credentialLevel ?? ""))}`
    : `/compare/matrix/entry/${encodeURIComponent(unitid)}`;
  const res = await authedFetch(path, { method: "DELETE" });
  if (!res.ok) throw new Error(`Remove compare matrix entry failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as CompareMatrixEntry[]) : [];
}

/**
 * GET /compare/matrix/details — enriched details for the caller's compare
 * matrix rows, same shape as fetchCompareSelected, but one row per matrix
 * entry (a college compared under two programs gets two rows) with each
 * row's own programs.selectedProgram already resolved from that row's own
 * cipCode/credentialLevel — no per-program round trip needed.
 */
export async function fetchCompareMatrixDetails(): Promise<
  SelectedCompareCollege[]
> {
  const res = await authedFetch("/compare/matrix/details");
  if (!res.ok)
    throw new Error(`Load comparison matrix details failed (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? (data as SelectedCompareCollege[]) : [];
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

// ---- Apply Now Click Analytics ----------------------------------------------

export interface TrackApplyClickPayload {
  universityId?: string | number | null;
  cipCode?: string | null;
  degree?: string | null;
  credentialLevel?: number | null;
  credentialTitle?: string | null;
  schoolUrl?: string | null;
}

/**
 * POST /analytics/apply-click — records when a user (or guest) clicks 'Apply Now'.
 * Uses authedFetch so signed-in users automatically attach their Authorization header.
 */
export async function trackApplyClick(
  payload: TrackApplyClickPayload,
): Promise<void> {
  try {
    await authedFetch("/analytics/apply-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        university_id: payload.universityId ? String(payload.universityId) : null,
        cip_code: payload.cipCode ?? null,
        degree: payload.degree ?? null,
        credential_level: payload.credentialLevel ?? null,
        credential_title: payload.credentialTitle ?? null,
        school_url: payload.schoolUrl ?? null,
        clicked_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Failed to track Apply Now click:", err);
  }
}

