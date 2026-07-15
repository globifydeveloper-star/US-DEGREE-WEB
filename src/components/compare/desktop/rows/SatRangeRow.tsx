"use client";

import { College } from "@/types/university/ComparisonTable";
import DesktopRowLabel from "../DesktopRowLabel";

interface SatRangeRowProps {
  colleges: College[];
}

export default function SatRangeRow({ colleges }: SatRangeRowProps) {
  return (
    <tr className="hover:bg-slate-50/30 transition-colors">
      <DesktopRowLabel title="SAT Score Range" subtitle="Middle 50th percentile bounds" />
      {colleges.map((college) => {
        if (college.satMin === null || college.satMax === null) {
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
            <span className="text-xs md:text-lg font-bold text-slate-900">
              {college.satMin} — {college.satMax}
            </span>
            <span className="block text-gray-400 text-[8px] md:text-[10px] mt-0.5 md:mt-1 font-bold">
              1600 Max
            </span>
          </td>
        );
      })}
    </tr>
  );
}
