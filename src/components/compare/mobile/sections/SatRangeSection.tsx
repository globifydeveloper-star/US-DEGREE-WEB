"use client";

import { College } from "@/types/university/ComparisonTable";
import MobileSectionCard from "../MobileSectionCard";
import MobileMetricRow from "../MobileMetricRow";

interface SatRangeSectionProps {
  colleges: College[];
  onViewDetails: (id: string) => void;
}

export default function SatRangeSection({ colleges, onViewDetails }: SatRangeSectionProps) {
  return (
    <MobileSectionCard title="SAT Score Range" subtitle="Middle 50th percentile bounds">
      {colleges.map((college) => (
        <MobileMetricRow key={college.id} college={college} onViewDetails={onViewDetails}>
          <span className="font-mono font-bold text-slate-900 shrink-0">
            {college.satMin !== null && college.satMax !== null
              ? `${college.satMin} — ${college.satMax}`
              : "N/A"}
          </span>
        </MobileMetricRow>
      ))}
    </MobileSectionCard>
  );
}
