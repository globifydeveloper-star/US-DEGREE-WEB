"use client";

import { College } from "@/types/university/ComparisonTable";
import DesktopComparisonTable from "./desktop/DesktopComparisonTable";
import MobileComparisonView from "./mobile/MobileComparisonView";

interface ComparisonTableProps {
  comparedColleges: College[];
  averages: { tuition: number; graduationRate: number; medianSalary: number };
  highlights: {
    lowestTuitionId: string;
    highestGraduationId: string;
    highestSalaryId: string;
    bestValueId: string;
  };
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

/**
 * Shows the compared colleges side by side: a full table on tablet/desktop
 * (DesktopComparisonTable) and a stack of scrollable cards on phones
 * (MobileComparisonView). Both read from the same `comparedColleges` data.
 */
export default function ComparisonTable(props: ComparisonTableProps) {
  return (
    <>
      <DesktopComparisonTable {...props} />
      <MobileComparisonView {...props} />
    </>
  );
}
