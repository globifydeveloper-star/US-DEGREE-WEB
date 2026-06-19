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
import { fetchSavedColleges, saveCollege, unsaveCollege } from "@/lib/auth/api";

export const SAVED_EVENT = "saved-colleges-updated";

let savedSet = new Set<string>();
let loaded = false;
let inflight: Promise<void> | null = null;

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SAVED_EVENT));
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

/** Toggle a unitid's saved state. Returns the new state. Reverts on error. */
export async function toggleSaved(unitid: string): Promise<boolean> {
  const key = String(unitid);
  const next = !savedSet.has(key);

  // Optimistic update so the button flips immediately.
  if (next) savedSet.add(key);
  else savedSet.delete(key);
  dispatch();

  try {
    if (next) await saveCollege(key);
    else await unsaveCollege(key);
    return next;
  } catch (err) {
    // Revert on failure.
    if (next) savedSet.delete(key);
    else savedSet.add(key);
    dispatch();
    throw err;
  }
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
