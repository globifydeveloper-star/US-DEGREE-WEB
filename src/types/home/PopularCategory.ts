// Static "Popular Categories" shown on the home page — see
// src/components/home/defaultCategories.ts.
export interface PopularCategory {
  /** CIP-family code. */
  category_id: string;
  category_name: string;
  /** Used to build the /search link; falls back to a category_name-based
   * search when absent. */
  slug?: string;
  description?: string;
  /** IPEDS credential_level code, 1-8 — see src/constants/credentialLevel.ts.
   * Null when the category has no single associated level. */
  credential_level: number | null;
  popularity_score: number;
  /** Display order, unique within the list. The grid must render in this
   * order as-is and must not re-sort client-side. */
  sort_order: number;
  thumbnail_url?: string | null;
}
