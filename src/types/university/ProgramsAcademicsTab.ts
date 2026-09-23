import type { CampusData } from "@/types/university/CampusStudentsTab";
import type { TuitionData } from "@/types/university/TuitionData";

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
  campusData?: CampusData | null;
  tuitionData?: TuitionData | null;
  programsData?: {
    popular_fields?: PopularField[];
    comprehensive_degree_levels?: DegreeLevel[];
  } | null;
}

export interface ProgramsAcademicsTabProps {
  data?: ProgramsAcademicsData | null;
}
