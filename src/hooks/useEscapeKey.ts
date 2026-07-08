"use client";

import { useEffect } from "react";

// Invoke `onEscape` when the Escape key is pressed while `active` is true.
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) {
        onEscape();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}
