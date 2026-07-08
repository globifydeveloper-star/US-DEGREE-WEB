// Minimal shapes for the backend JSON the university page consumes. Every field
// is optional because the endpoints may omit data; we only declare what is read.
export type ApiNum = number | string | null;

export interface ApiOverview {
  program?: { cip_code?: string };
  school?: {
    school_name?: string;
    school_description?: string;
    program_count?: number | null;
    accreditor?: string | null;
  };
  students?: {
    size?: number | null;
    student_faculty_ratio?: ApiNum;
    retention_rate?: number | null;
    fafsa_applications?: number | null;
  };
  admissions?: {
    admission_rate?: number | null;
    sat_avg_overall?: ApiNum;
    sat_rw_min?: number | null;
    sat_rw_max?: number | null;
    sat_math_min?: number | null;
    sat_math_max?: number | null;
    // Testing-requirements disclosure (publishable rows only; the backend
    // suppresses Tier 3). Absent/null category ⇒ show the numeric SAT range.
    satDisclosureCategory?: string | null;
    badgeLabel?: string | null;
    badgeColor?: string | null;
    supportingCopy?: string | null;
    disclaimerTier?: number | null;
    disclaimerText?: string | null;
    showAdmissionRateRequired?: boolean | null;
  };
  completion?: { completion_rate?: number | null };
  earnings?: {
    year_1?: ApiNum;
    year_5?: ApiNum;
    year_10?: ApiNum;
    growth_rate?: ApiNum;
    avg_salary?: ApiNum;
  };
  roi?: { roi_20yr?: ApiNum };
  school_description?: string;
}

export interface ApiOutcomes {
  earnings?: {
    year_1?: ApiNum;
    year_5?: ApiNum;
    year_10?: ApiNum;
    growth_rate?: ApiNum;
    avg_salary?: ApiNum;
  };
  roi?: { roi_20yr?: ApiNum };
  completion?: { emp_factor?: ApiNum };
  debt_income_ratio?: { debt_income_ratio?: ApiNum };
}

export interface ApiCampus {
  campus?: { student_faculty_ratio?: ApiNum };
}

export interface ApiCollege {
  school_name?: string;
  city?: string;
  state?: string;
  school_type?: string;
  school_url?: string | null;
  accreditor?: string | null;
}

export interface ApiUni {
  unitid?: string | number;
  accreditor?: string | null;
}

export interface UniversitySearchParams {
  cip?: string;
  name?: string;
  city?: string;
  state?: string;
  degree?: string;
  type?: string;
  admissionRate?: string;
  tuition?: string;
  avgSalary?: string;
  roi?: string;
}
