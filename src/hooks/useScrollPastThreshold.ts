"use client";

import { useEffect, useState } from "react";

// Returns true once the window has scrolled past `threshold` pixels.
export function useScrollPastThreshold(threshold: number) {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setPassed(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return passed;
}
