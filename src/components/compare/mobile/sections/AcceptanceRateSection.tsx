"use client";

import { College } from "@/types/university/ComparisonTable";
import MobileSectionCard from "../MobileSectionCard";
import MobileMetricRow from "../MobileMetricRow";

interface AcceptanceRateSectionProps {
  colleges: College[];
  onViewDetails: (id: string) => void;
}

export default function AcceptanceRateSection({
  colleges,
  onViewDetails,
}: AcceptanceRateSectionProps) {
  return (
    <MobileSectionCard title="Acceptance Rate" subtitle="Selectivity benchmark percentage">
      {colleges.map((college) => {
        const rate = college.acceptanceRate;

        if (rate === null) {
          return (
            <MobileMetricRow key={college.id} college={college} onViewDetails={onViewDetails}>
              <span className="font-mono font-bold text-slate-400 shrink-0">N/A</span>
            </MobileMetricRow>
          );
        }

        const isHighlyCompetitive = rate < 0.08;
        const isCompetitive = rate < 0.2;

        return (
          <MobileMetricRow key={college.id} college={college} onViewDetails={onViewDetails}>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-bold text-slate-900">
                {(rate * 100).toFixed(1)}%
              </span>
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                  isHighlyCompetitive
                    ? "bg-red-50 text-red-600"
                    : isCompetitive
                      ? "bg-orange-50 text-orange-600"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {isHighlyCompetitive ? "Selective" : isCompetitive ? "Competitive" : "Match"}
              </span>
            </div>
          </MobileMetricRow>
        );
      })}
    </MobileSectionCard>
  );
}
