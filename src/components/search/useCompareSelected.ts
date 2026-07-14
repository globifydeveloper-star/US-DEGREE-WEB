"use client";

/**
 * SINGLE SOURCE OF TRUTH for the "selected for comparison" set.
 *
 * Canonical state is the backend `/compare/selected` set. This module also
 * maintains a localStorage mirror — `compared_colleges` (unitids) and
 * `compared_colleges_details` (display info: name/location/cipCode/…) — for:
 *   - instant, SSR-safe reads (the Navbar badge),
 *   - the /compare matrix page + CompareDeck, which render the detail info.
 *
 * Every selection mutation (add/remove/clear) goes through this module, which
 * updates BOTH the in-memory set and the localStorage mirror, persists to the
 * backend, and notifies subscribers via a single dispatch. The 5-college cap is
 * enforced here, centrally, so it holds no matter where the college is added
 * from (search cards, university page, college matches, or the compare page).
 *
 * Mutations are optimistic and revert on backend failure.
 */

import { useEffect, useState } from "react";
import {
  fetchCompareSelected,
  addCompareSelected,
  removeCompareSelected,
  hasAuthenticatedUser,
  type SelectedCompareCollege,
} from "@/lib/auth/api";

// Fired for store subscribers (cards, Navbar, profile section).
export const COMPARE_SELECTED_EVENT = "compare-selected-updated";
// Legacy event still listened to by the matrix page + CompareDeck; dispatched
// alongside the above so those keep working unchanged.
export const COMPARE_BUCKET_EVENT = "compared-colleges-updated";
export const MAX_COMPARE = 5;

const BUCKET_KEY = "compared_colleges";
const DETAILS_KEY = "compared_colleges_details";

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

/**
 * Optional payload carried on COMPARE_SELECTED_EVENT so the profile's "Colleges
 * Selected for Comparison" grid can update instantly from the in-memory record
 * instead of waiting on a backend refetch. When absent, listeners reload.
 */
export type CompareChangeDetail =
  | { action: "added"; record: SelectedCompareCollege }
  | { action: "removed"; unitid: string }
  | { action: "cleared" };

let selectedSet = new Set<string>();
let loaded = false;
let initialized = false;
let inflight: Promise<void> | null = null;

// ---- localStorage mirror helpers (SSR-safe) ----
function readBucket(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(BUCKET_KEY) || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function readDetails(): CompareDetail[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(DETAILS_KEY) || "[]");
    return Array.isArray(v) ? (v as CompareDetail[]) : [];
  } catch {
    return [];
  }
}

function writeBucket(ids: string[], details: CompareDetail[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUCKET_KEY, JSON.stringify(ids));
  localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
}

function dispatch(detail?: CompareChangeDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMPARE_SELECTED_EVENT, { detail }));
    window.dispatchEvent(new Event(COMPARE_BUCKET_EVENT));
  }
}

// Seed the in-memory set from the localStorage mirror once, so reads are
// correct immediately on a fresh page (before the backend load resolves).
function initFromBucket() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  selectedSet = new Set(readBucket());
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

/** Load the backend set once (authoritative), reconciling the mirror. */
export async function ensureCompareLoaded(): Promise<void> {
  initFromBucket();
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      // No signed-in user (e.g. navbar badge on a public page) → nothing to
      // load. Leave `loaded` false so it retries after login.
      if (!(await hasAuthenticatedUser())) return;
      const list = await fetchCompareSelected();
      const ids = list.map((c) => String(c.unitid));
      selectedSet = new Set(ids);

      // Keep existing local details for known ids; synthesise minimal details
      // (from the backend enrichment) for any the mirror doesn't have yet.
      const byId = new Map(readDetails().map((d) => [String(d.id), d]));
      const mergedDetails: CompareDetail[] = ids.map((id) => {
        const existing = byId.get(id);
        if (existing) return existing;
        const row = list.find((c) => String(c.unitid) === id);
        return {
          id,
          name: row?.name,
          location: row?.location,
          cipCode: "default",
        };
      });
      writeBucket(ids, mergedDetails);
      loaded = true;
      dispatch();
    } catch (err) {
      // Offline / not authed → keep the localStorage-seeded set as a fallback.
      console.error("Failed to load comparison set:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Force a reload from the backend. */
export async function reloadCompareSelected(): Promise<void> {
  loaded = false;
  return ensureCompareLoaded();
}

export type AddResult = "added" | "exists" | "full";

/**
 * Add a college to the comparison set. Returns "full" when the cap is hit.
 *
 * Pass `enriched` (a fully-shaped record) when the caller already has the
 * college's display fields — it is broadcast on COMPARE_SELECTED_EVENT so the
 * profile's comparison grid shows the new card immediately, with no refetch.
 */
export async function addToCompare(
  detail: CompareDetail,
  enriched?: SelectedCompareCollege,
): Promise<AddResult> {
  initFromBucket();
  const id = String(detail.id);
  if (!id) return "exists";
  if (selectedSet.has(id)) return "exists";
  if (selectedSet.size >= MAX_COMPARE) return "full";

  // Optimistic update of the set + mirror.
  selectedSet.add(id);
  const ids = readBucket();
  if (!ids.includes(id)) ids.push(id);
  const details = readDetails();
  if (!details.some((d) => String(d.id) === id)) {
    details.push({
      cipCode: "default",
      logoColor: "bg-blue-600",
      ...detail,
      id,
    });
  }
  writeBucket(ids, details);
  dispatch(enriched ? { action: "added", record: enriched } : undefined);

  try {
    await addCompareSelected(id);
  } catch (err) {
    selectedSet.delete(id);
    writeBucket(
      readBucket().filter((x) => x !== id),
      readDetails().filter((d) => String(d.id) !== id),
    );
    dispatch({ action: "removed", unitid: id });
    throw err;
  }
  return "added";
}

/** Remove a college from the comparison set. */
export async function removeFromCompare(unitid: string): Promise<void> {
  initFromBucket();
  const id = String(unitid);
  const had = selectedSet.has(id);
  const prevDetails = readDetails();

  selectedSet.delete(id);
  writeBucket(
    readBucket().filter((x) => x !== id),
    prevDetails.filter((d) => String(d.id) !== id),
  );
  dispatch({ action: "removed", unitid: id });

  try {
    await removeCompareSelected(id);
  } catch (err) {
    if (had) {
      selectedSet.add(id);
      const ids = readBucket();
      if (!ids.includes(id)) ids.push(id);
      const restored = prevDetails.find((d) => String(d.id) === id);
      const details = readDetails();
      if (restored && !details.some((d) => String(d.id) === id)) {
        details.push(restored);
      }
      writeBucket(ids, details);
      // No enriched record on hand to restore the card from — reload to reconcile.
      dispatch();
    }
    throw err;
  }
}

/** Clear the entire comparison set. */
export async function clearCompare(): Promise<void> {
  // Load the authoritative backend set first. On the /compare page the
  // in-memory set is only ever seeded once from the localStorage mirror, which
  // can be stale (or empty) relative to the backend — clearing just that would
  // leave colleges behind in the profile's "Colleges Selected for Comparison"
  // section. Unioning with the mirror covers offline/fallback too.
  await ensureCompareLoaded();
  const ids = new Set<string>([...selectedSet, ...readBucket()]);
  selectedSet = new Set();
  writeBucket([], []);
  // Broadcast an explicit "cleared" so listeners empty their view immediately
  // WITHOUT refetching. A plain reload dispatch here would race the backend
  // deletes below and could momentarily repopulate from the still-full set.
  dispatch({ action: "cleared" });
  // Delete every id independently. allSettled (not all) so one failed/duplicate
  // delete can't abort the rest or throw — the bucket must end up empty even if
  // a single backend call rejects.
  const results = await Promise.allSettled(
    Array.from(ids).map((id) => removeCompareSelected(id)),
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `Failed to clear ${failed.length} comparison entr${
        failed.length === 1 ? "y" : "ies"
      } on backend:`,
      failed,
    );
  }
  // Reconcile listeners once the backend deletes have all been attempted.
  dispatch();
}

/**
 * Toggle a college's membership; returns the resulting action. Pass `enriched`
 * so a fresh selection appears in the profile comparison grid instantly.
 */
export async function toggleCompare(
  detail: CompareDetail,
  enriched?: SelectedCompareCollege,
): Promise<AddResult | "removed"> {
  if (isCompareSelected(detail.id)) {
    await removeFromCompare(detail.id);
    return "removed";
  }
  return addToCompare(detail, enriched);
}

// ---- React hooks ----

/** Reactive selected-state for a single card's unitid. */
export function useCompareSelectedItem(unitid?: string | null): boolean {
  const [selected, setSelected] = useState<boolean>(
    unitid ? isCompareSelected(unitid) : false,
  );

  useEffect(() => {
    if (!unitid) return;
    ensureCompareLoaded();
    const handler = () => setSelected(isCompareSelected(unitid));
    handler();
    window.addEventListener(COMPARE_SELECTED_EVENT, handler);
    return () => window.removeEventListener(COMPARE_SELECTED_EVENT, handler);
  }, [unitid]);

  return selected;
}

/** Reactive list of selected unitids (for components that render the whole set). */
export function useCompareIds(): string[] {
  const [ids, setIds] = useState<string[]>(getCompareIds());

  useEffect(() => {
    ensureCompareLoaded();
    const handler = () => setIds(getCompareIds());
    handler();
    window.addEventListener(COMPARE_SELECTED_EVENT, handler);
    return () => window.removeEventListener(COMPARE_SELECTED_EVENT, handler);
  }, []);

  return ids;
}

/**
 * Reactive count of selected colleges (used by the Navbar + mobile dock badge).
 * Backed by the authoritative `/compare/selected` set, so the badge always
 * matches the profile's "Colleges Selected for Comparison" section. Starts at 0
 * for SSR-safe hydration, then syncs (and triggers the one-time backend load)
 * on mount.
 */
export function useCompareCount(): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    ensureCompareLoaded();
    const handler = () => setCount(getCompareCount());
    handler();
    // A logged-out load bails early; reload once the user signs in/out so the
    // badge reflects their backend comparison set.
    const onAuthChange = () => reloadCompareSelected();
    window.addEventListener(COMPARE_SELECTED_EVENT, handler);
    window.addEventListener(COMPARE_BUCKET_EVENT, handler);
    window.addEventListener("auth-state-changed", onAuthChange);
    return () => {
      window.removeEventListener(COMPARE_SELECTED_EVENT, handler);
      window.removeEventListener(COMPARE_BUCKET_EVENT, handler);
      window.removeEventListener("auth-state-changed", onAuthChange);
    };
  }, []);

  return count;
}
