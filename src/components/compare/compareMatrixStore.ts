"use client";

/**
 * SINGLE SOURCE OF TRUTH for "colleges queued for comparison" — program-aware
 * and page-agnostic. Every add-to-compare surface (search cards, the profile's
 * Intelligent Matches card, the university page, and the /compare page's own
 * filter) goes through this module so they share one implementation instead
 * of drifting, as the old college-level-only `compareStore.ts` did.
 *
 * Canonical state lives on the backend (`/compare/matrix`); mirrored in
 * localStorage (MATRIX_ENTRIES_KEY, owned by writeMatrixEntries in
 * ./compareEntryIds) for instant, SSR-safe reads. There is deliberately no
 * separate in-memory cache of the id list here — every read goes straight to
 * localStorage, the same pattern useCompareCount.ts already uses, so there's
 * nothing that can go stale relative to it.
 *
 * Adds/removes go through the atomic POST/DELETE /compare/matrix/entry
 * endpoints (not the whole-list PUT /compare/matrix), so multiple independent
 * UI surfaces mutating concurrently can't clobber each other's rows. Only
 * clearCompare uses the whole-list PUT, since "replace everything with
 * nothing" has no concurrent-mutation hazard.
 */

import { useEffect, useState } from "react";
import {
  fetchCompareMatrix,
  saveCompareMatrix,
  addCompareMatrixEntry,
  removeCompareMatrixEntry,
  CompareLimitReachedError,
  hasAuthenticatedUser,
} from "@/lib/auth/api";
import {
  makeEntryId,
  parseEntryId,
  apiEntriesToMatrixIds,
  apiEntriesToPrograms,
  readEntryPrograms,
  writeEntryPrograms,
  writeMatrixEntries,
} from "./compareEntryIds";
import { MATRIX_ENTRIES_KEY, MATRIX_UPDATED_EVENT } from "@/hooks/useCompareCount";

export const MAX_COMPARE = 5;
const OWNER_KEY = "compare_matrix_owner";

export type AddResult = "added" | "exists" | "full";

export interface CollegeProgramDetail {
  unitid: string;
  cipCode?: string;
  credentialLevel?: number | string;
  programName?: string;
  credentialTitle?: string;
}

let loaded = false;
let inflight: Promise<void> | null = null;

function readEntries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(MATRIX_ENTRIES_KEY) || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

// ---- Synchronous getters ----
export function getCompareEntryIds(): string[] {
  return readEntries();
}
export function getCompareCount(): number {
  return readEntries().length;
}
export function isCollegeCompared(unitid: string): boolean {
  const id = String(unitid);
  return readEntries().some((e) => parseEntryId(e).unitid === id);
}

// Tag the mirror with the signed-in user's id, dropping it whenever that id
// changes — otherwise the browser-scoped mirror leaks one account's picks
// into whichever account signs in next on the same browser.
export function syncCompareMatrixOwner(ownerId: string | number | null): void {
  if (typeof window === "undefined") return;
  const key = ownerId != null ? String(ownerId) : "";
  if (localStorage.getItem(OWNER_KEY) === key) return;
  loaded = false;
  writeMatrixEntries([]);
  writeEntryPrograms({});
  localStorage.setItem(OWNER_KEY, key);
}

// Load the backend matrix once (authoritative), reconciling the mirror.
export async function ensureMatrixLoaded(): Promise<void> {
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      if (!(await hasAuthenticatedUser())) return;
      const backendEntries = await fetchCompareMatrix();
      const backendIds = apiEntriesToMatrixIds(backendEntries);
      // Union with whatever's already local — an add can land while this
      // load is in flight, and the backend list alone would silently drop it.
      const ids = Array.from(new Set([...backendIds, ...readEntries()]));
      writeMatrixEntries(ids);
      writeEntryPrograms({
        ...apiEntriesToPrograms(backendEntries),
        ...readEntryPrograms(),
      });
      loaded = true;
    } catch (err) {
      console.error("Failed to load comparison matrix:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

// Force a reload from the backend (bypassing the `loaded` cache) — needed
// whenever another surface may have mutated the backend matrix behind this
// module's back, or the cached load happened before a college was added.
export async function reloadMatrix(): Promise<void> {
  loaded = false;
  return ensureMatrixLoaded();
}

// Add a college (optionally scoped to a specific program) to the comparison
// matrix. Returns "full" once the 5-entry cap is hit (enforced server-side),
// "exists" for an exact duplicate (same college + same course + same
// credential level) caught locally before ever hitting the network.
export async function addCollegeToCompare(
  detail: CollegeProgramDetail,
): Promise<AddResult> {
  const unitid = String(detail.unitid);
  if (!unitid) return "exists";
  const cipCode = detail.cipCode || "default";
  const entryId = makeEntryId(unitid, cipCode, detail.credentialLevel);

  if (readEntries().includes(entryId)) return "exists";

  try {
    const backendEntries = await addCompareMatrixEntry({
      unitid,
      cipCode: cipCode === "default" ? null : cipCode,
      credentialLevel: detail.credentialLevel ?? null,
      programName: detail.programName ?? null,
      credentialTitle: detail.credentialTitle ?? null,
    });
    writeMatrixEntries(apiEntriesToMatrixIds(backendEntries));
    writeEntryPrograms(apiEntriesToPrograms(backendEntries));
  } catch (err) {
    if (err instanceof CompareLimitReachedError) return "full";
    throw err;
  }
  return "added";
}

// Remove a college from the matrix. With no `opts`, removes every entry for
// that college (used by the plain toggle-off on search/profile/university
// cards, which don't know/care about a specific program). With `opts.cipCode`,
// removes only that one program entry (used by the /compare page's own
// per-program remove).
export async function removeCollegeFromCompare(
  unitid: string,
  opts?: { cipCode?: string; credentialLevel?: number | string },
): Promise<void> {
  const id = String(unitid);
  const backendEntries = await removeCompareMatrixEntry(
    id,
    opts?.cipCode
      ? { cipCode: opts.cipCode, credentialLevel: opts.credentialLevel }
      : undefined,
  );
  writeMatrixEntries(apiEntriesToMatrixIds(backendEntries));
  writeEntryPrograms(apiEntriesToPrograms(backendEntries));
}

// Clear the entire comparison matrix. The only mutation still using the
// whole-list PUT — "replace everything with nothing" has no concurrent-
// mutation hazard the way one-at-a-time adds/removes do.
export async function clearCompare(): Promise<void> {
  const prevIds = readEntries();
  writeMatrixEntries([]);
  writeEntryPrograms({});
  try {
    await saveCompareMatrix([]);
  } catch (err) {
    writeMatrixEntries(prevIds);
    throw err;
  }
}

// Toggle a college's membership (any program); returns the resulting action.
export async function toggleCompare(
  detail: CollegeProgramDetail,
): Promise<AddResult | "removed"> {
  if (isCollegeCompared(detail.unitid)) {
    await removeCollegeFromCompare(detail.unitid);
    return "removed";
  }
  return addCollegeToCompare(detail);
}

// ---- React hooks ----

function useCompareMatrixSync<T>(read: () => T, deps: unknown[]): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    ensureMatrixLoaded();
    const handler = () => setValue(read());
    handler();
    window.addEventListener(MATRIX_UPDATED_EVENT, handler);
    return () => window.removeEventListener(MATRIX_UPDATED_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

/** Reactive "is this college (any program) currently compared" state. */
export function useIsCollegeCompared(unitid?: string | null): boolean {
  return useCompareMatrixSync(
    () => (unitid ? isCollegeCompared(unitid) : false),
    [unitid],
  );
}

/** Reactive list of compared entry ids, for components rendering the whole set. */
export function useCompareEntryIds(): string[] {
  return useCompareMatrixSync(getCompareEntryIds, []);
}
