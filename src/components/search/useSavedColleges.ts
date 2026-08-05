"use client";

/**
 * Shared client-side store for saved-college state.
 *
 * The set of saved unitids is loaded ONCE per session from GET /saved-colleges
 * (guarded by `loaded`/`inflight`) and shared across every card via a window
 * event, so N visible cards don't trigger N fetches. Toggling is optimistic and
 * reverts on failure. Mirrors the existing `compared-colleges-updated` pattern.
 */

import { useEffect, useState } from "react";
import {
  fetchSavedColleges,
  saveCollege,
  unsaveCollege,
  hasAuthenticatedUser,
  type SavedCollege,
} from "@/lib/auth/api";

export const SAVED_EVENT = "saved-colleges-updated";

// ---- Program/credential cache ---------------------------------------------
//
// POST /saved-colleges only persists `{ unitid }` — the backend has no notion
// of *which* program a college was saved under, so GET /saved-colleges can
// never return programName/credentialLevel/credentialTitle. To still show
// that context on the Saved Colleges grid after a reload (not just in the
// instant right after clicking Save), stash it client-side in localStorage,
// keyed by unitid, and merge it back onto whatever the backend returns.

const PROGRAM_CACHE_KEY = "usd-saved-college-programs";

type CachedProgramInfo = Pick<
  SavedCollege,
  "cipCode" | "programName" | "credentialLevel" | "credentialTitle"
>;

function readProgramCache(): Record<string, CachedProgramInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRAM_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeProgramCache(cache: Record<string, CachedProgramInfo>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRAM_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable/full — the cache is best-effort only.
  }
}

/** Remember which program a college was saved under, so it survives a reload. */
function rememberProgramInfo(unitid: string, info: CachedProgramInfo) {
  const cache = readProgramCache();
  cache[String(unitid)] = info;
  writeProgramCache(cache);
}

/** Forget a college's cached program info (call on unsave). */
export function forgetProgramInfo(unitid: string) {
  const cache = readProgramCache();
  if (!(String(unitid) in cache)) return;
  delete cache[String(unitid)];
  writeProgramCache(cache);
}

/**
 * Merge cached program info onto backend-fetched records that came back
 * without it (every record, currently — see the comment above). Records that
 * already carry a cipCode (e.g. the optimistic record just broadcast on save)
 * are left untouched.
 */
export function applyProgramCache(list: SavedCollege[]): SavedCollege[] {
  const cache = readProgramCache();
  if (Object.keys(cache).length === 0) return list;
  return list.map((c) => {
    if (c.cipCode) return c;
    const cached = cache[String(c.unitid)];
    return cached ? { ...c, ...cached } : c;
  });
}

/**
 * Optional payload carried on the SAVED_EVENT so listeners (e.g. the profile's
 * Saved Colleges grid) can update instantly from the in-memory record instead
 * of waiting on a backend refetch. When no detail is present, listeners should
 * fall back to a full reload.
 */
export type SavedChangeDetail =
  | { action: "added"; record: SavedCollege }
  | { action: "removed"; unitid: string };

let savedSet = new Set<string>();
let loaded = false;
let inflight: Promise<void> | null = null;

function dispatch(detail?: SavedChangeDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail }));
  }
}

export function isSaved(unitid: string): boolean {
  return savedSet.has(String(unitid));
}

/** Load the saved set once. Repeat calls are no-ops / await the in-flight load. */
export async function ensureSavedLoaded(): Promise<void> {
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      // No signed-in user → nothing to load. Leave `loaded` false so a later
      // call (after login) retries.
      if (!(await hasAuthenticatedUser())) return;
      const list = await fetchSavedColleges();
      savedSet = new Set(list.map((c) => String(c.unitid)));
      loaded = true;
      dispatch();
    } catch (err) {
      console.error("Failed to load saved colleges:", err);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Force a reload (e.g. after the profile section removes an entry). */
export async function reloadSaved(): Promise<void> {
  loaded = false;
  return ensureSavedLoaded();
}

/**
 * Toggle a unitid's saved state. Returns the new state. Reverts on error.
 *
 * Pass `optimistic` (an enriched record) when the caller already has the
 * college's display fields — it is broadcast on the SAVED_EVENT so the Saved
 * Colleges grid can show the new card immediately, with no refetch delay.
 */
export async function toggleSaved(
  unitid: string,
  optimistic?: SavedCollege,
): Promise<boolean> {
  const key = String(unitid);
  const next = !savedSet.has(key);

  const addDetail: SavedChangeDetail | undefined = optimistic
    ? { action: "added", record: optimistic }
    : undefined;
  const removeDetail: SavedChangeDetail = { action: "removed", unitid: key };

  // Optimistic update so the button flips immediately.
  if (next) savedSet.add(key);
  else savedSet.delete(key);
  dispatch(next ? addDetail : removeDetail);

  // Cache the program context client-side (see the note above) so it
  // survives the reload that follows a save, or forget it on unsave.
  if (next && optimistic?.cipCode) {
    rememberProgramInfo(key, {
      cipCode: optimistic.cipCode,
      programName: optimistic.programName ?? null,
      credentialLevel: optimistic.credentialLevel ?? null,
      credentialTitle: optimistic.credentialTitle ?? null,
    });
  } else if (!next) {
    forgetProgramInfo(key);
  }

  try {
    if (next) await saveCollege(key);
    else await unsaveCollege(key);
    return next;
  } catch (err) {
    // Revert on failure.
    if (next) savedSet.delete(key);
    else savedSet.add(key);
    dispatch(next ? removeDetail : addDetail);
    if (next && optimistic?.cipCode) forgetProgramInfo(key);
    throw err;
  }
}

/**
 * React hook: the reactive set of saved unitids, as an array. Use this when a
 * component renders many cards at once (e.g. a grid) and cannot call the
 * per-card `useSavedCollege` hook inside a loop.
 */
export function useSavedIds(): string[] {
  const [ids, setIds] = useState<string[]>(() => Array.from(savedSet));

  useEffect(() => {
    ensureSavedLoaded();
    const handler = () => setIds(Array.from(savedSet));
    handler(); // sync immediately in case the set is already loaded
    window.addEventListener(SAVED_EVENT, handler);
    return () => window.removeEventListener(SAVED_EVENT, handler);
  }, []);

  return ids;
}

/** React hook: reactive saved-state for a single card's unitid. */
export function useSavedCollege(unitid?: string | null): boolean {
  const [saved, setSaved] = useState<boolean>(unitid ? isSaved(unitid) : false);

  useEffect(() => {
    if (!unitid) return;
    ensureSavedLoaded();
    const handler = () => setSaved(isSaved(unitid));
    handler(); // sync immediately in case the set is already loaded
    window.addEventListener(SAVED_EVENT, handler);
    return () => window.removeEventListener(SAVED_EVENT, handler);
  }, [unitid]);

  return saved;
}
