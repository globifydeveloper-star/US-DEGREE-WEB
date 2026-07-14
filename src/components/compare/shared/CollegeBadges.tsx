"use client";

import { Sparkles } from "lucide-react";

interface CollegeBadgesProps {
  isPrivate: boolean;
  isBestValue: boolean;
  isHighSalary: boolean;
  isLowestCost: boolean;
  /** "lg" is used in the desktop table header, "sm" in the mobile top card. */
  size?: "lg" | "sm";
}

const TEXT_SIZE = { lg: "text-[8px] md:text-[9px]", sm: "text-[8px]" };
const PADDING = { lg: "px-1.5 md:px-2.5 py-0.5 md:py-1", sm: "px-2 py-0.5" };

/**
 * The row of small badges shown under a college's name: Public/Private,
 * plus "Best ROI" / "Salary Leader" / "Lowest Cost" when applicable.
 */
export default function CollegeBadges({
  isPrivate,
  isBestValue,
  isHighSalary,
  isLowestCost,
  size = "lg",
}: CollegeBadgesProps) {
  const textSize = TEXT_SIZE[size];
  const padding = PADDING[size];
  const iconSize = size === "lg" ? "w-2.5 h-2.5 md:w-3 md:h-3" : "w-2.5 h-2.5";

  return (
    <>
      <span
        className={`${textSize} font-bold uppercase tracking-widest text-gray-400 border border-gray-100/80 ${padding} rounded-md`}
      >
        {isPrivate ? "Private" : "Public"}
      </span>
      {isBestValue && (
        <span
          className={`${textSize} font-black uppercase tracking-widest text-[#22C55E] bg-green-50 ${padding} rounded-md border border-green-100 flex items-center gap-0.5 md:gap-1`}
        >
          <Sparkles className={iconSize} /> Best ROI
        </span>
      )}
      {isHighSalary && !isBestValue && (
        <span
          className={`${textSize} font-black uppercase tracking-widest text-[#3F51B5] bg-blue-50 ${padding} rounded-md border border-blue-100`}
        >
          💰 Salary Leader
        </span>
      )}
      {isLowestCost && (
        <span
          className={`${textSize} font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 ${padding} rounded-md border border-emerald-100`}
        >
          📉 Lowest Cost
        </span>
      )}
    </>
  );
}
