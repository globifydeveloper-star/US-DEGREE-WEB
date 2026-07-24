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

// Historical shape of the (now-removed) cross-app "compared_colleges_details"
// localStorage mirror. Nothing writes this key anymore — buildCollegeRow's
// `storedDetails` lookups always resolve empty and fall back to backend data
// — but the type is kept so those defensive fallback paths still compile.
export interface StoredDetail {
  id: string;
  name?: string;
  location?: string;
  city?: string;
  state?: string;
  schoolType?: string;
  cipCode?: string;
  programName?: string;
  schoolUrl?: string;
  logo?: string;
  logoColor?: string;
}
