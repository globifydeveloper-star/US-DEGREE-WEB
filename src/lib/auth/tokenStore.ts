/**
 * In-memory store for the backend **app JWT** (NOT the Firebase ID token).
 *
 * Kept in memory rather than localStorage to limit XSS exposure (per the auth
 * spec §4.7). It is intentionally lost on a full page reload — that is safe
 * because the Firebase SDK persists its own session, so on the next app load
 * `onAuthStateChanged` fires and we re-exchange a fresh Firebase ID token for a
 * new app JWT (see `exchangeIdToken` in ./api).
 *
 * The Firebase ID token is a separate concept and never lives here: it is used
 * only at POST /auth/login.
 */

let appJwt: string | null = null;

export function getAppJwt(): string | null {
  return appJwt;
}

export function setAppJwt(token: string | null): void {
  appJwt = token;
}

export function clearAppJwt(): void {
  appJwt = null;
}
