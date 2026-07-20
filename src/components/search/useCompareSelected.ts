"use client";

/**
 * React hooks for the "selected for comparison" store (./compareStore).
 * Components that only need to read/mutate the set (no reactive re-render)
 * should import directly from compareStore instead.
 */

import { useEffect, useState } from "react";
import {
  COMPARE_SELECTED_EVENT,
  ensureCompareLoaded,
  isCompareSelected,
  getCompareIds,
} from "./compareStore";

// Re-export the store's public API so existing imports of
// "./useCompareSelected" keep working unchanged.
export * from "./compareStore";

// Shared subscribe-and-sync boilerplate for both hooks below.
function useCompareSync<T>(read: () => T, deps: unknown[]): T {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    ensureCompareLoaded();
    const handler = () => setValue(read());
    handler();
    window.addEventListener(COMPARE_SELECTED_EVENT, handler);
    return () => window.removeEventListener(COMPARE_SELECTED_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

/** Reactive selected-state for a single card's unitid. */
export function useCompareSelectedItem(unitid?: string | null): boolean {
  return useCompareSync(() => (unitid ? isCompareSelected(unitid) : false), [unitid]);
}

/** Reactive list of selected unitids, for components rendering the whole set. */
export function useCompareIds(): string[] {
  return useCompareSync(getCompareIds, []);
}
