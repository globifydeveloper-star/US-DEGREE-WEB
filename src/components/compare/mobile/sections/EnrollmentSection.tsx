"use client";

import { College } from "@/types/university/ComparisonTable";
import MobileSectionCard from "../MobileSectionCard";
import MobileMetricRow from "../MobileMetricRow";

interface EnrollmentSectionProps {
  colleges: College[];
  onViewDetails: (id: string) => void;
}

export default function EnrollmentSection({ colleges, onViewDetails }: EnrollmentSectionProps) {
  return (
    <MobileSectionCard title="Student Enrollment" subtitle="Total size">
      {colleges.map((college) => (
        <MobileMetricRow key={college.id} college={college} onViewDetails={onViewDetails}>
          <span className="font-mono font-bold text-slate-900 shrink-0">
            {college.studentPopulation !== null
              ? college.studentPopulation.toLocaleString()
              : "N/A"}
          </span>
        </MobileMetricRow>
      ))}
    </MobileSectionCard>
  );
}
