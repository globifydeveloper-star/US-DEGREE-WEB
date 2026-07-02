// Backend value that may arrive as a number, a numeric string, or be missing.
type ApiNum = number | string | null | undefined;

export interface CampusData {
  campus?: {
    size_category?: string | null;
    size?: ApiNum;
    student_faculty_ratio?: string | null;
    avg_family_income?: ApiNum;
  };
  students?: {
    grad_students?: ApiNum;
    demographics?: { men?: ApiNum; women?: ApiNum };
    faculty?: { men?: ApiNum; women?: ApiNum };
    choice_aid?: ApiNum;
  };
  repayment?: {
    all_borrowers_3yr?: ApiNum;
    graduates_3yr?: ApiNum;
    non_completers_3yr?: ApiNum;
    yr1_overall?: ApiNum;
    yr3_overall?: ApiNum;
    yr3_completers?: ApiNum;
    yr3_noncompleters?: ApiNum;
  };
}

export interface CampusStudentsTabProps {
  campusData: CampusData | null;
  fafsaApplications?: number | null;
}
