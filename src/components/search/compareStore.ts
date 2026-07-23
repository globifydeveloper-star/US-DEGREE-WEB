"use client";

/**
 * SINGLE SOURCE OF TRUTH for the "selected for comparison" set. Canonical
 * state lives on the backend (`/compare/selected`); mirrored in localStorage
 * for instant, SSR-safe reads. COLLEGE-level (one row per unitid) — NOT the
 * Navbar badge count (per-program matrix entries, hooks/useCompareCount.ts).
 * Mutations are optimistic, reverting on failure. React hooks built on this
 * store live in ./useCompareSelected.
 */

import {
  fetchCompareSelected,
  addCompareSelected,
  removeCompareSelected,
  hasAuthenticatedUser,
  type CompareSummary,
} from "@/lib/auth/api";
import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";

export const COMPARE_SELECTED_EVENT = "compare-selected-updated";
export const COMPARE_BUCKET_EVENT = "compared-colleges-updated"; // legacy, still used by matrix page + CompareDeck
export const MAX_COMPARE = 5;
const BUCKET_KEY = "compared_colleges";
const DETAILS_KEY = "compared_colleges_details";
const OWNER_KEY = "compared_colleges_owner";

/** Display info for one selected college (kept in the localStorage mirror). */
export interface CompareDetail {
  id: string;
  name?: string;
  location?: string;
  city?: string;
  state?: string;
  schoolType?: string;
  cipCode?: string;
  programName?: string;
  schoolUrl?: string;
  logoColor?: string;
}

/** Payload on COMPARE_SELECTED_EVENT so listeners can update in place. */
export type CompareChangeDetail =
  | { action: "added"; record: CompareSummary }
  | { action: "removed"; unitid: string }
  | { action: "cleared" };

export type AddResult = "added" | "exists" | "full";
let selectedSet = new Set<string>();
let loaded = false;
let initialized = false;
let inflight: Promise<void> | null = null;

// ---- localStorage mirror helpers (SSR-safe) ----
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
const readBucket = () => readJSON<string[]>(BUCKET_KEY, []).map(String);
const readDetails = () => readJSON<CompareDetail[]>(DETAILS_KEY, []);
function writeBucket(ids: string[], details: CompareDetail[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUCKET_KEY, JSON.stringify(ids));
  localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
}
function dispatch(detail?: CompareChangeDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COMPARE_SELECTED_EVENT, { detail }));
  window.dispatchEvent(new Event(COMPARE_BUCKET_EVENT));
}
// Seed the in-memory set from the mirror once, before the backend load resolves.
function initFromBucket() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  selectedSet = new Set(readBucket());
}

// Tag the mirror with the signed-in user's id, dropping it whenever that id
// changes — otherwise the browser-scoped mirror leaks one account's picks
// into whichever account signs in next on the same browser.
export function syncCompareOwner(ownerId: string | number | null): void {
  if (typeof window === "undefined") return;
  const key = ownerId != null ? String(ownerId) : "";
  if (localStorage.getItem(OWNER_KEY) === key) return;
  initialized = true;
  selectedSet = new Set();
  loaded = false;
  writeBucket([], []);
  localStorage.setItem(OWNER_KEY, key);
  localStorage.setItem(MATRIX_ENTRIES_KEY, "[]"); // matrix mirror has the same leak risk
  localStorage.removeItem(ENTRY_PROGRAMS_KEY);
  window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));
  dispatch();
}
// ---- Synchronous getters ----
export function isCompareSelected(unitid: string): boolean {
  initFromBucket();
  return selectedSet.has(String(unitid));
}
export function getCompareIds(): string[] {
  initFromBucket();
  return Array.from(selectedSet);
}
export function getCompareCount(): number {
  initFromBucket();
  return selectedSet.size;
}
// Load the backend set once (authoritative), reconciling the mirror.
export async function ensureCompareLoaded(): Promise<void> {
  initFromBucket();
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      // No signed-in user (e.g. navbar badge on a public page): leave `loaded`
      // false so it retries after login.
      if (!(await hasAuthenticatedUser())) return;
      const list = await fetchCompareSelected();
      const backendIds = list.filter((c) => c.unitid != null).map((c) => String(c.unitid));
      // Union with the in-memory set — an add can land while this load is in
      // flight, and the backend list alone would silently drop it.
      const ids = Array.from(new Set([...backendIds, ...selectedSet]));
      selectedSet = new Set(ids);
      // Keep known local details; synthesise minimal ones for any new id.
      const byId = new Map(readDetails().map((d) => [String(d.id), d]));
      const details: CompareDetail[] = ids.map((id) => {
        const row = list.find((c) => String(c.unitid) === id);
        return (
          byId.get(id) ?? {
            id,
            name: row?.name ?? undefined,
            location: row?.location ?? undefined,
            schoolUrl: row?.schoolUrl ?? undefined,
            schoolType: row?.schoolType ?? undefined,
            cipCode: "default",
          }
        );
      });
      writeBucket(ids, details);
      loaded = true;
      dispatch();
    } catch (err) {
      console.error("Failed to load comparison set:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
// Force a reload from the backend.
export async function reloadCompareSelected(): Promise<void> {
  loaded = false;
  return ensureCompareLoaded();
}
// Add a college to the comparison set. Returns "full" once the cap is hit.
// Pass `enriched` when the caller has the display fields on hand, so the
// profile grid can show the new card instantly via COMPARE_SELECTED_EVENT.
export async function addToCompare(
  detail: CompareDetail,
  enriched?: CompareSummary,
): Promise<AddResult> {
  initFromBucket();
  const id = String(detail.id);
  if (!id) return "exists";
  if (selectedSet.has(id)) return "exists";
  if (selectedSet.size >= MAX_COMPARE) return "full";
  selectedSet.add(id);
  const ids = [...readBucket(), id];
  const details = [
    ...readDetails(),
    { cipCode: "default", logoColor: "bg-blue-600", ...detail, id },
  ];
  writeBucket(ids, details);
  dispatch(enriched ? { action: "added", record: enriched } : undefined);
  try {
    await addCompareSelected(id);
  } catch (err) {
    selectedSet.delete(id);
    writeBucket(
      ids.filter((x) => x !== id),
      details.filter((d) => String(d.id) !== id),
    );
    dispatch({ action: "removed", unitid: id });
    throw err;
  }
  return "added";
}
// Remove a college from the comparison set.
export async function removeFromCompare(unitid: string): Promise<void> {
  initFromBucket();
  const id = String(unitid);
  const had = selectedSet.has(id);
  const prevIds = readBucket();
  const prevDetails = readDetails();
  selectedSet.delete(id);
  writeBucket(
    prevIds.filter((x) => x !== id),
    prevDetails.filter((d) => String(d.id) !== id),
  );
  dispatch({ action: "removed", unitid: id });
  try {
    await removeCompareSelected(id);
  } catch (err) {
    if (had) {
      selectedSet.add(id);
      writeBucket(prevIds, prevDetails);
      dispatch(); // no enriched record on hand — reload to reconcile
    }
    throw err;
  }
}
// Clear the entire comparison set.
export async function clearCompare(): Promise<void> {
  // Reconcile with the backend first — the in-memory set is only ever seeded
  // once from a mirror that can be stale/empty relative to it.
  await ensureCompareLoaded();
  const ids = new Set<string>([...selectedSet, ...readBucket()]);
  selectedSet = new Set();
  writeBucket([], []);
  dispatch({ action: "cleared" }); // clear listeners before the backend catches up
  // Removed one at a time, not in parallel: the backend's DELETE endpoint
  // does a read-modify-write on the user's stored set, so concurrent
  // requests race on a stale read and only the last write survives —
  // sequencing them avoids that lost-update.
  const failed: unknown[] = [];
  for (const id of ids) {
    try {
      await removeCompareSelected(id);
    } catch (err) {
      failed.push(err);
    }
  }
  if (failed.length > 0) {
    console.error(`Failed to clear ${failed.length} comparison entries:`, failed);
  }
  dispatch();
}

// Toggle a college's membership; returns the resulting action. Pass
// `enriched` so a fresh selection appears in the profile grid instantly.
export async function toggleCompare(
  detail: CompareDetail,
  enriched?: CompareSummary,
): Promise<AddResult | "removed"> {
  if (isCompareSelected(detail.id)) {
    await removeFromCompare(detail.id);
    return "removed";
  }
  return addToCompare(detail, enriched);
}
