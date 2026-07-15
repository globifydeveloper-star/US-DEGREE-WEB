/**
 * Small math helpers shared between the desktop table rows and the
 * mobile comparison sections, so the "how far from average" logic
 * only lives in one place.
 */

/** How far `value` is from `average`, as a rounded percentage (e.g. -12 means 12% below average). */
export function relativePercentDiff(value: number, average: number): number {
  if (average <= 0) return 0;
  return Math.round(((value - average) / average) * 100);
}

/** How far `value` is from `average`, in percentage points (used for rates like graduation rate). */
export function percentagePointsDiff(value: number, average: number): number {
  return (value - average) * 100;
}
