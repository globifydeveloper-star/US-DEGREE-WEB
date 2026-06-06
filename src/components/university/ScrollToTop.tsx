"use client";

import { useEffect } from "react";

/**
 * Forces the browser to scroll to the top of the page when this component mounts.
 * Drop this into any page that should start at the top on navigation.
 */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
