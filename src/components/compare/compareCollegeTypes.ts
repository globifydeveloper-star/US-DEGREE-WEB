import type { CompareDetail } from "@/components/search/compareStore";

/** One row in the university dropdown / "Quick Add" list. */
export type UniOption = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  schoolType?: string;
};

/** A single row from GET /compare/colleges (list or search results). */
export interface RawUniversity {
  unitid?: string | number;
  id?: string | number;
  value?: string | number;
  school_name?: string;
  name?: string;
  label?: string;
  city?: string;
  state?: string;
  school_type?: string;
  college_type?: string;
  control?: string;
}

// Same shape written to (and read from) the cross-app "compared_colleges_details"
// localStorage mirror — see CompareDetail in components/search/compareStore.
// `logo` is compare-page-specific, so it's added on top rather than shared.
export type StoredDetail = CompareDetail & { logo?: string };
