import { EarningsFillMethod } from "@/types/earningsMethod";

export interface OutcomesSectionProps {
  salaryYear1?: number | string | null;
  salaryYear5?: number | string | null;
  salaryYear10?: number | string | null;
  salaryYear1Method?: EarningsFillMethod | null;
  salaryYear5Method?: EarningsFillMethod | null;
  salaryYear10Method?: EarningsFillMethod | null;
  netRoi20Yr?: number | string | null;
  growthRate?: number | string | null;
  empFactor?: number | string | null;
  debtIncomeRatio?: number | string | null;
  loanPrincipal?: number | string | null;
  avgSalary?: number | string | null;
  programTitle?: string;
}
