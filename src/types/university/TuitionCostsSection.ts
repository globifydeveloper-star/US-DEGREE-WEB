import type { TuitionData } from "@/types/university/TuitionData";

export interface TuitionCostsSectionProps {
  // Every field the backend's /tuition/:id response can omit is optional on
  // the shared TuitionData type; this component already reads through it
  // with optional chaining, so its prop type should say the same thing
  // instead of (incorrectly) requiring every sub-object.
  tuitionData?: TuitionData | null;
  schoolName?: string;
  tuitionType?: "in_state" | "out_state";
  setTuitionType?: (type: "in_state" | "out_state") => void;
}
