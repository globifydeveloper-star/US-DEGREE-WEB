"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { AuthUser } from "@/context/AuthContext";
import { FIT_LOGIN_INTENT_KEY } from "@/lib/fitScoreSync";

// After a signed-out user was bounced to login from a result card's fit-score
// button, send them back to the search page they came from once authenticated.
// The matching card then re-opens its "Calculate Your Fit Score" popup.
export function useFitLoginRedirect(user: AuthUser | null) {
  const router = useRouter();

  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    let intent: { url?: string } | null = null;
    try {
      const raw = localStorage.getItem(FIT_LOGIN_INTENT_KEY);
      intent = raw ? JSON.parse(raw) : null;
    } catch {
      intent = null;
    }
    if (intent?.url) {
      const here = window.location.pathname + window.location.search;
      if (here !== intent.url) router.push(intent.url);
    }
  }, [user, router]);
}
