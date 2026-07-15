"use client";

import { College } from "@/types/university/ComparisonTable";
import MobileSectionCard from "../MobileSectionCard";
import MobileMetricRow from "../MobileMetricRow";

interface ProgramSectionProps {
  colleges: College[];
  onViewDetails: (id: string) => void;
}

export default function ProgramSection({ colleges, onViewDetails }: ProgramSectionProps) {
  return (
    <MobileSectionCard title="Program Details" subtitle="Compared program & CIP code">
      {colleges.map((college) => (
        <MobileMetricRow key={college.id} college={college} onViewDetails={onViewDetails}>
          {college.programName ? (
            <div className="flex flex-col items-end shrink-0 max-w-[140px]">
              <span className="font-bold text-slate-900 text-right truncate max-w-full">
                {college.programName}
              </span>
              {college.cipCode && college.cipCode !== "default" && (
                <span className="text-[9px] font-black uppercase text-[#3F51B5] bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                  CIP {college.cipCode}
                </span>
              )}
            </div>
          ) : (
            <span className="font-mono font-bold text-slate-400 shrink-0">N/A</span>
          )}
        </MobileMetricRow>
      ))}
    </MobileSectionCard>
  );
}
