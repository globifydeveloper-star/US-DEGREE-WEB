// Shape returned by GET /popular-categories/personalized — see
// src/lib/home/popularCategoriesApi.ts.
export interface PopularCategory {
  /** CIP-family code. Not unique per response — the same category_id repeats
   * once per credential_level bucket, so don't use it alone as a list key. */
  category_id: string;
  category_name: string;
  /** Not currently returned by GET /popular-categories/personalized — falls
   * back to a category_name-based search when absent. */
  slug?: string;
  description?: string;
  /** IPEDS credential_level code, 1-8 — see src/constants/credentialLevel.ts */
  credential_level: number;
  popularity_score: number;
  /** Server-assigned display order, unique within a response. The grid must
   * render in this order as-is and must not re-sort client-side. */
  sort_order: number;
  thumbnail_url?: string | null;
}

export type PopularCategoriesSource =
  | "default"
  | "default_biased"
  | "personalized"
  | "personalized_state_relaxed";

export interface PopularCategoriesResponse {
  categories: PopularCategory[];
  source: PopularCategoriesSource;
  /** True when the user is logged in but hasn't completed Match
   * Preferences yet — the grid still renders `categories` (default set)
   * below the soft-gate prompt. */
  showCompletePrompt: boolean;
}
