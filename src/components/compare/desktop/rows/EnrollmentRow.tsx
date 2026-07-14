"use client";

import { College } from "@/types/university/ComparisonTable";
import DesktopRowLabel from "../DesktopRowLabel";

interface EnrollmentRowProps {
  colleges: College[];
}

export default function EnrollmentRow({ colleges }: EnrollmentRowProps) {
  return (
    <tr className="hover:bg-slate-50/30 transition-colors">
      <DesktopRowLabel title="Student Enrollment" subtitle="Total size" />
      {colleges.map((college) => {
        if (college.studentPopulation === null) {
          return (
            <td
              key={college.id}
              className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400"
            >
              N/A
            </td>
          );
        }

        return (
          <td key={college.id} className="p-4 md:p-8 text-center font-mono">
            <span className="text-sm md:text-xl font-bold text-slate-900">
              {college.studentPopulation.toLocaleString()}
            </span>
            <span className="block text-gray-400 text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1">
              students
            </span>
          </td>
        );
      })}
    </tr>
  );
}
