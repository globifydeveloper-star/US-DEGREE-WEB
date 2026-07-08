"use client";

import { useEffect, useState } from "react";

import type { AuthUser } from "@/context/AuthContext";
import type { AuthMode } from "@/types/auth";

export function useLoginModal(user: AuthUser | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const open = (nextMode: AuthMode) => {
    setMode(nextMode);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  // Open the login modal when redirected here with ?login=1 (e.g. an
  // unauthenticated user was bounced off a protected page like /compare).
  // Read from window to avoid needing a useSearchParams Suspense boundary.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1" && !user) {
      // Reading the URL is a client-only post-mount sync; a lazy useState
      // initializer would cause an SSR/hydration mismatch here.
      /* eslint-disable react-hooks/set-state-in-effect */
      setMode("login");
      setIsOpen(true);
      /* eslint-enable react-hooks/set-state-in-effect */
      params.delete("login");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? `?${query}` : ""),
      );
    }
  }, [user]);

  return { isOpen, mode, open, close };
}
