"use client";

import { useEffect } from "react";

// Lock body scroll while `locked` is true (e.g. an open modal/drawer).
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [locked]);
}
