export interface AdmissionsOverviewProps {
  admissionRate: string;
  applicants: string;
  satReadingWriting: string;
  satMath: string;
  satAverage: string;
  salaryYear1?: number | string | null;
  salaryYear10?: number | string | null;
  netRoi20Yr?: number | string | null;
  growthRate?: number | string | null;
}

export interface ScoreBarProps {
  label: string;
  range: string;
  percent: number;
}