import { AthleticsData } from "@/types/university/AthleticsData";
import AthleticsMetricCards, {
  AthleticsMetricCardsSkeleton,
} from "./AthleticsMetricCards";
import RevenueExpenseChart from "./RevenueExpenseChart";
import RosterBySportGenderChart from "./RosterBySportGenderChart";
import AthleticsSummaryParagraph from "./AthleticsSummaryParagraph";

interface AthleticsTabProps {
  data: AthleticsData | null;
  isLoading?: boolean;
}

export default function AthleticsTab({
  data,
  isLoading = false,
}: AthleticsTabProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 py-6 max-w-4xl">
        <AthleticsMetricCardsSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-8 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-center">
          <p className="text-sm text-slate-500 font-poppins">
            Athletics disclosure data isn&apos;t available for this school.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 max-w-4xl">
      <div className="flex items-center gap-2 flex-wrap">
        {data.division && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EEF2FF] text-[#2563EB] text-xs font-bold font-poppins">
            {data.division}
          </span>
        )}
        {data.surveyYear && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-slate-600 text-xs font-bold font-poppins">
            {data.surveyYear} data
          </span>
        )}
      </div>

      <AthleticsMetricCards data={data} />

      <RevenueExpenseChart data={data} />

      {data.hasRosterData ? (
        <RosterBySportGenderChart roster={data.roster} />
      ) : (
        <p className="text-sm text-slate-500 font-poppins">
          Detailed roster breakdown isn&apos;t available for this school yet.
        </p>
      )}

      <AthleticsSummaryParagraph summaryParagraph={data.summaryParagraph} />
    </div>
  );
}
