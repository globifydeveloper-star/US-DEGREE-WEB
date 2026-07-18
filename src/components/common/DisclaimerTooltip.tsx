"use client";

import React from "react";
import { Tooltip } from "antd";

interface DisclaimerTooltipProps {
  text: string;
  className?: string;
}

/**
 * A small "?" affordance that reveals a data-source disclaimer.
 *  - Hover opens it after a short delay so a mouse passing over the screen
 *    doesn't trigger it, and closes the instant the cursor leaves.
 *  - Keyboard users reach it via Tab; it opens on focus.
 *  - Touch devices (no hover) get tap-to-open/tap-to-close instead.
 *  - Placement auto-flips so it's never clipped by the viewport edge.
 *  - The full text is exposed via `aria-label` so screen readers announce it
 *    without needing the tooltip to be open.
 */
export default function DisclaimerTooltip({
  text,
  className,
}: DisclaimerTooltipProps) {
  return (
    <Tooltip
      title={text}
      trigger={["hover", "focus", "click"]}
      mouseEnterDelay={0.25}
      mouseLeaveDelay={0}
      autoAdjustOverflow
      placement="top"
    >
      <button
        type="button"
        aria-label={`Data source disclaimer: ${text}`}
        className={[
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold leading-none text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        ?
      </button>
    </Tooltip>
  );
}
