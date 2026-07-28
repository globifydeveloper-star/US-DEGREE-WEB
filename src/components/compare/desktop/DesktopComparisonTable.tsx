"use client";

import { College } from "@/types/university/ComparisonTable";
import DesktopCollegeHeader from "./DesktopCollegeHeader";
import ProgramRow from "./rows/ProgramRow";
import TuitionInStateRow from "./rows/TuitionInStateRow";
import TuitionOutOfStateRow from "./rows/TuitionOutOfStateRow";
import AcceptanceRateRow from "./rows/AcceptanceRateRow";
import GraduationRateRow from "./rows/GraduationRateRow";
import SatRangeRow from "./rows/SatRangeRow";
import SalaryRow from "./rows/SalaryRow";
import EnrollmentRow from "./rows/EnrollmentRow";
import ActionsRow from "./rows/ActionsRow";

interface DesktopComparisonTableProps {
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
 * The full comparison table shown on tablet/desktop screens. Only visible
 * at the "md" breakpoint and above — see MobileComparisonView for phones.
 */
export default function DesktopComparisonTable({
  comparedColleges,
  averages,
  highlights,
  onRemove,
  onViewDetails,
}: DesktopComparisonTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto overflow-y-clip rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-left border-collapse table-fixed min-w-[768px] md:min-w-[1000px]">
        <thead>
          <tr className="border-b border-gray-100 bg-[#FAFBFD]/90 backdrop-blur sticky z-20">
<th className="w-32 md:w-60 p-4 md:p-6 font-black text-slate-900 text-xs md:text-lg sticky left-0 bg-[#FAFBFD] z-30 border-r border-gray-100">              Institutional Criteria
            </th>
            {comparedColleges.map((college) => (
              <DesktopCollegeHeader
                key={college.id}
                college={college}
                isBestValue={highlights.bestValueId === college.id}
                isHighSalary={highlights.highestSalaryId === college.id}
                isLowestCost={highlights.lowestTuitionId === college.id}
                onRemove={onRemove}
                onViewDetails={onViewDetails}
              />
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          <ProgramRow colleges={comparedColleges} />
          <TuitionInStateRow colleges={comparedColleges} />
          <TuitionOutOfStateRow
            colleges={comparedColleges}
            averageTuition={averages.tuition}
            lowestTuitionId={highlights.lowestTuitionId}
          />
          <AcceptanceRateRow colleges={comparedColleges} />
          <GraduationRateRow
            colleges={comparedColleges}
            averageGraduationRate={averages.graduationRate}
            highestGraduationId={highlights.highestGraduationId}
          />
          <SatRangeRow colleges={comparedColleges} />
          <SalaryRow
            colleges={comparedColleges}
            averageSalary={averages.medianSalary}
            highestSalaryId={highlights.highestSalaryId}
          />
          <EnrollmentRow colleges={comparedColleges} />
          <ActionsRow colleges={comparedColleges} onViewDetails={onViewDetails} />
        </tbody>
      </table>
    </div>
  );
}
