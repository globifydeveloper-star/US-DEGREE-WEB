"use client";

import { useEffect, useRef, useState } from "react";

// Sub-threshold deltas are ignored so tiny scroll jitter (mobile rubber-band,
// trackpad noise) can't flicker the nav in and out.
const HIDE_THRESHOLD_PX = 10;
// Always keep the nav visible near the very top of the page.
const TOP_REVEAL_ZONE_PX = 24;

/**
 * Generic "hide on scroll down, show on scroll up" visibility state. Ignores
 * movements smaller than HIDE_THRESHOLD_PX so it doesn't flicker, and always
 * shows near the top of the page. Scroll is sampled via a passive listener
 * throttled to one check per animation frame.
 */
export function useScrollAwareVisibility(): boolean {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastYRef.current;

        if (currentY <= TOP_REVEAL_ZONE_PX) {
          setVisible(true);
          lastYRef.current = currentY;
        } else if (Math.abs(delta) >= HIDE_THRESHOLD_PX) {
          setVisible(delta < 0); // scrolling up -> show, down -> hide
          lastYRef.current = currentY;
        }
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return visible;
}
