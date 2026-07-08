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

/** A college selected for comparison, enriched by GET /compare/selected. */
export interface SelectedCompareCollege {
  unitid: string;
  name: string;
  location: string;
  tuitionInState: number | string | null;
  acceptanceRate: number | string | null;
  addedAt: string | null;
}

/** GET /compare/selected — the user's comparison set, enriched by the backend. */
export async function fetchCompareSelected(): Promise<
  SelectedCompareCollege[]
> {
  const res = await authedFetch("/compare/selected");
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
