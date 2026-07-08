"use client";

import { useSyncExternalStore } from "react";

// Subscribe to the compared-colleges list stored in localStorage so the badge
// count stays in sync across tabs and in-app updates.
const subscribeCompareCount = (onChange: () => void) => {
  window.addEventListener("compared-colleges-updated", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("compared-colleges-updated", onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getCompareCountSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem("compared_colleges") || "[]").length;
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
