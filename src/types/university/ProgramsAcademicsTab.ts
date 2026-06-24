export interface PopularField {
  field_name: string;
  percentage: number;
}

export interface DegreeLevel {
  level: string;
  total_programs: number;
  top_titles: string[];
}

export interface ProgramsAcademicsData {
  name?: string;
  admissionRate?: string | number;
  totalStudents?: number | null;
  completionRate?: string | number;
  facultyRatio?: string | number;
  tuitionFee?: string;
  campusData?: {
    repayment?: {
      all_borrowers_3yr?: number | string | null;
    };
  };
  tuitionData?: {
    tuition?: {
      tuition_in_state?: number | string | null;
    };
  };
  programsData?: {
    popular_fields?: PopularField[];
    comprehensive_degree_levels?: DegreeLevel[];
  };
}

export interface ProgramsAcademicsTabProps {
  data?: ProgramsAcademicsData | null;
}
