"use client";

import React from "react";
import { Tooltip } from "antd";
import {
  CheckCircle2,
  TrendingUp,
  Info,
  AlertTriangle,
  Clock,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import {
  EarningsFillMethod,
  EARNINGS_METHOD_LABEL,
  describeEarningsMethod,
} from "@/types/earningsMethod";

const METHOD_STYLE: Record<
  EarningsFillMethod,
  { icon: LucideIcon; classes: string }
> = {
  user_reported: {
    icon: CheckCircle2,
    classes: "text-green-600 border-green-200 hover:border-green-400",
  },
  interpolated: {
    icon: TrendingUp,
    classes: "text-teal-600 border-teal-200 hover:border-teal-400",
  },
  extrapolated: {
    icon: Info,
    classes: "text-slate-500 border-slate-300 hover:border-slate-400",
  },
  low_confidence: {
    icon: AlertTriangle,
    classes: "text-amber-600 border-amber-300 hover:border-amber-400",
  },
  skipped_future: {
    icon: Clock,
    classes: "text-gray-400 border-gray-300 hover:border-gray-400",
  },
  skipped_no_anchor: {
    icon: HelpCircle,
    classes: "text-gray-400 border-gray-300 hover:border-gray-400",
  },
};

// Pill-variant background/text/border, grouped by confidence tier rather than
// one color per method — reported is its own tier, interpolated/extrapolated
// share "estimated", and the two skipped_* methods share a muted "no data"
// treatment so they read as a different kind of state, not just another tier.
const METHOD_PILL_CLASSES: Record<EarningsFillMethod, string> = {
  user_reported: "bg-green-50 text-green-700 border-green-200",
  interpolated: "bg-blue-50 text-blue-700 border-blue-200",
  extrapolated: "bg-blue-50 text-blue-700 border-blue-200",
  low_confidence: "bg-amber-50 text-amber-700 border-amber-300",
  skipped_future: "bg-gray-100 text-gray-500 border-gray-300",
  skipped_no_anchor: "bg-gray-100 text-gray-500 border-gray-300",
};

interface EarningsMethodBadgeProps {
  method: EarningsFillMethod;
  /** grad_cohort year this figure was resolved from (e.g. "2016"), when the
   * backend provides one. Each of year_1/5/10 is resolved independently and
   * can legitimately carry a different cohort — always pass the cohort that
   * matches this specific metric, not a page-wide value. */
  cohort?: string | null;
  className?: string;
  /** "icon" (default) is the small circular affordance used inline next to a
   * label. "pill" renders the labeled badge (e.g. "Reported", "Estimated"). */
  variant?: "icon" | "pill";
}

/**
 * Small hover/tap affordance shown next to a year_1/year_5/year_10 earnings
 * figure, explaining how that figure was derived. Same interaction pattern as
 * DisclaimerTooltip (hover w/ delay, focus, and tap-to-open on touch devices).
 */
export default function EarningsMethodBadge({
  method,
  cohort,
  className,
  variant = "icon",
}: EarningsMethodBadgeProps) {
  const { icon: Icon, classes } = METHOD_STYLE[method];
  const text = describeEarningsMethod(method, cohort);
  // const showCohortInPill =
  //   variant === "pill" && cohort && method !== "skipped_no_anchor";

  const trigger = (
    <button
      type="button"
      aria-label={`Earnings estimate method: ${text}`}
      className={
        variant === "pill"
          ? [
              "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              METHOD_PILL_CLASSES[method],
              className,
            ]
              .filter(Boolean)
              .join(" ")
          : [
              "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              classes,
              className,
            ]
              .filter(Boolean)
              .join(" ")
      }
    >
      {variant === "pill" ? (
        <>
          {EARNINGS_METHOD_LABEL[method]}
          {/* {showCohortInPill && <> &middot; Class f {cohort}</>} */}
        </>
      ) : (
        <Icon size={10} strokeWidth={2.5} />
      )}
    </button>
  );

  return (
    <Tooltip
      title={text}
      trigger={["hover", "focus", "click"]}
      mouseEnterDelay={0.25}
      mouseLeaveDelay={0}
      autoAdjustOverflow
      placement="top"
    >
      {trigger}
    </Tooltip>
  );
}
