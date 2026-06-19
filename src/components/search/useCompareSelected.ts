"use client";

/**
 * Shared client-side store for the "selected for comparison" set, backed by the
 * backend (GET/POST/DELETE /compare/selected). Mirrors useSavedColleges: the
 * set of unitids loads once per session and is shared across cards via a window
 * event; mutations are optimistic and revert on failure.
 *
 * This is distinct from the localStorage `compared_colleges` bucket that drives
 * the /compare matrix page — that uses the `compared-colleges-updated` event.
 */

import { useEffect, useState } from "react";
import {
  fetchCompareSelected,
  addCompareSelected,
  removeCompareSelected,
} from "@/lib/auth/api";

export const COMPARE_SELECTED_EVENT = "compare-selected-updated";

let selectedSet = new Set<string>();
let loaded = false;
let inflight: Promise<void> | null = null;

function dispatch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMPARE_SELECTED_EVENT));
  }
}

export function isCompareSelected(unitid: string): boolean {
  return selectedSet.has(String(unitid));
}

/** Load the selected set once. Repeat calls are no-ops / await the in-flight load. */
export async function ensureCompareLoaded(): Promise<void> {
  if (loaded) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const list = await fetchCompareSelected();
      selectedSet = new Set(list.map((c) => String(c.unitid)));
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

/** Force a reload (e.g. after the profile section removes an entry). */
export async function reloadCompareSelected(): Promise<void> {
  loaded = false;
  return ensureCompareLoaded();
}

/**
 * Set a unitid's selected state explicitly (POST to add, DELETE to remove).
 * Optimistic; reverts on failure. No-op if already in the desired state.
 */
export async function setCompareSelected(
  unitid: string,
  selected: boolean,
): Promise<void> {
  const key = String(unitid);
  if (selectedSet.has(key) === selected) return;

  if (selected) selectedSet.add(key);
  else selectedSet.delete(key);
  dispatch();

  try {
    if (selected) await addCompareSelected(key);
    else await removeCompareSelected(key);
  } catch (err) {
    // Revert on failure.
    if (selected) selectedSet.delete(key);
    else selectedSet.add(key);
    dispatch();
    throw err;
  }
}

/** React hook: reactive selected-state for a single card's unitid. */
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
