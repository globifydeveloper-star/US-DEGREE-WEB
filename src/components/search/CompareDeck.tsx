"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCompareCount } from "@/hooks/useCompareCount";

// Lightweight floating reminder that colleges are queued for comparison —
// deliberately just a counter/CTA, not its own list of colleges. The one
// place that shows the actual compare list is the /compare page itself; see
// the "Unify Add to Compare" refactor.
export default function CompareDeck() {
  const router = useRouter();
  const compareCount = useCompareCount();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Scheduled (not synchronous) so the button still slides in after a 50ms
    // delay and out immediately once the compare set is emptied.
    const t = setTimeout(
      () => setIsVisible(compareCount > 0),
      compareCount > 0 ? 50 : 0,
    );
    return () => clearTimeout(t);
  }, [compareCount]);

  if (compareCount === 0) return null;

  return (
    <button
      onClick={() => router.push("/compare")}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-6 rounded-full shadow-[0_10px_50px_rgba(0,0,0,0.15)] active:scale-95 hover:scale-105 transition-all cursor-pointer select-none ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <span>Compare ({compareCount})</span>
      <ArrowRight size={16} />
    </button>
  );
}
