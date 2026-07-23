import { Info } from "lucide-react";

/**
 * Inline note shown when the personalized categories fell back to other
 * states because the user's preferred state didn't have enough matches
 * (source === "personalized_state_relaxed").
 */
export default function StateRelaxedNote() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm mb-6 sm:mb-8">
      <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
      <span>
        Showing results from other states — limited matches in your
        preferred state.
      </span>
    </div>
  );
}
