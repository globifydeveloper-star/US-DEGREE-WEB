"use client";

import { useEffect } from "react";
import { notification } from "antd";

// Breakpoint mirrors Tailwind's `lg` (and the .ant-message CSS override in
// globals.css): bottom-right on large screens, top on mobile.
const LARGE_SCREEN_QUERY = "(min-width: 1024px)";

/**
 * Configures global Ant Design `notification` placement responsively so the
 * profile's success/error popups appear in the bottom-right on large screens
 * and at the top on mobile. (`message` placement is handled via CSS, since
 * antd v6 `message` has no bottom/right placement option.)
 *
 * Renders nothing — it only sets the global notification config on mount and
 * keeps it in sync as the viewport crosses the breakpoint.
 */
export default function PopupConfig() {
  useEffect(() => {
    const mql = window.matchMedia(LARGE_SCREEN_QUERY);
    const apply = () => {
      notification.config({ placement: mql.matches ? "bottomRight" : "top" });
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return null;
}
