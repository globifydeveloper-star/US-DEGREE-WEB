"use client";

import { useSyncExternalStore } from "react";

/**
 * The nav badge counts entries in the /compare matrix (one per program), not
 * distinct colleges — adding two programs from the same college counts as 2.
 * This is intentionally separate from the cross-app "compare selected" store
 * (useCompareSelected.ts), which is college-level (one row per unitid) and
 * drives search-card highlighting / the profile "selected for comparison"
 * grid. `useCompareColleges` is the sole writer of this key, via
 * `writeMatrixEntries`, every time the on-page matrix changes.
 */
export const MATRIX_ENTRIES_KEY = "compare_matrix_entries";
export const MATRIX_UPDATED_EVENT = "compare-matrix-updated";
// Local-only map of entryId -> {programName, credentialTitle}; also exported
// here (rather than from useCompareColleges.ts) so useCompareSelected.ts can
// clear it on account switch without an import cycle.
export const ENTRY_PROGRAMS_KEY = "compare_entry_programs";

const subscribeCompareCount = (onChange: () => void) => {
  window.addEventListener(MATRIX_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(MATRIX_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getCompareCountSnapshot = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(MATRIX_ENTRIES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

const getCompareCountServerSnapshot = () => 0;

export function useCompareCount() {
  return useSyncExternalStore(
    subscribeCompareCount,
    getCompareCountSnapshot,
    getCompareCountServerSnapshot,
  );
}
