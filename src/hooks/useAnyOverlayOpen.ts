"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether ANY modal/drawer/bottom-sheet is currently open, without
 * each overlay needing to report itself individually. Every overlay in this
 * app already locks page scroll the same way when it opens — directly via
 * `useBodyScrollLock`/`document.body.style.overflow = "hidden"` (filter
 * drawer, compare details modal, the auth modal) or via antd's own `Modal`
 * scroll lock — so watching that single shared signal covers all of them,
 * present and future, with zero per-component wiring.
 */
export function useAnyOverlayOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const style = getComputedStyle(document.body);
      setOpen(style.overflow === "hidden" || style.overflowY === "hidden");
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, []);

  return open;
}
