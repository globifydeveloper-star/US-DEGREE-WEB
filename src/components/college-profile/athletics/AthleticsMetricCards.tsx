import { AthleticsData } from "@/types/university/AthleticsData";
import {
  formatCurrency,
  formatCurrencyAbbreviated,
} from "./athleticsFormat";

interface AthleticsMetricCardsProps {
  data: AthleticsData;
}

export default function AthleticsMetricCards({
  data,
}: AthleticsMetricCardsProps) {
  const summary = data.summary;
  const benchmark = data.divisionBenchmark;
  const hasFootball = data.roster.some(
    (row) => row.sport.toLowerCase() === "football",
  );

  const cards = [
    {
      label: "Student-athletes",
      value:
        summary?.athletesTotal != null
          ? summary.athletesTotal.toString()
          : "N/A",
      subtext:
        summary?.athletesMen != null && summary?.athletesWomen != null
          ? `${summary.athletesMen} men · ${summary.athletesWomen} women`
          : null,
      benchmarkNote:
        benchmark?.avgAthletesTotal != null
          ? `Division avg: ${Math.round(benchmark.avgAthletesTotal)}`
          : null,
    },
    {
      label: "Avg aid / athlete",
      value: formatCurrency(summary?.avgAidPerAthlete),
      subtext:
        summary?.athleticAidTotal != null
          ? `${formatCurrency(summary.athleticAidTotal)} total aid`
          : null,
      benchmarkNote:
        benchmark?.avgAidPerAthlete != null
          ? `Division avg: ${formatCurrency(benchmark.avgAidPerAthlete)}`
          : null,
    },
    {
      label: "Sports offered",
      value:
        data.sportsOffered != null ? data.sportsOffered.toString() : "N/A",
      subtext: hasFootball ? "incl. football" : null,
      benchmarkNote: null,
    },
    {
      label: "Recruiting spend",
      value: formatCurrencyAbbreviated(summary?.recruitingExpense),
      subtext:
        summary?.recruitingExpensePerAthlete != null
          ? `${formatCurrency(summary.recruitingExpensePerAthlete)} / athlete`
          : null,
      benchmarkNote:
        benchmark?.avgRecruitingExpense != null
          ? `Division avg: ${formatCurrencyAbbreviated(benchmark.avgRecruitingExpense)}`
          : null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col gap-1.5"
        >
          <p className="text-[13px] font-bold text-slate-500 font-poppins">
            {card.label}
          </p>
          <p className="text-2xl font-medium text-black font-poppins">
            {card.value}
          </p>
          {card.subtext && (
            <p className="text-xs text-slate-500 font-poppins">
              {card.subtext}
            </p>
          )}
          {card.benchmarkNote && (
            <p className="text-[10px] text-slate-400 font-poppins">
              {card.benchmarkNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function AthleticsMetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col gap-2 animate-pulse"
        >
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-28 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}
