"use client";

import { College } from "@/types/university/ComparisonTable";
import DesktopRowLabel from "../DesktopRowLabel";

interface AcceptanceRateRowProps {
  colleges: College[];
}

export default function AcceptanceRateRow({ colleges }: AcceptanceRateRowProps) {
  return (
    <tr className="hover:bg-slate-50/30 transition-colors">
      <DesktopRowLabel title="Acceptance Rate" subtitle="Selectivity benchmark percentage" />
      {colleges.map((college) => {
        const rate = college.acceptanceRate;

        if (rate === null) {
          return (
            <td
              key={college.id}
              className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400"
            >
              N/A
            </td>
          );
        }

        const isHighlyCompetitive = rate < 0.08;
        const isCompetitive = rate < 0.2;

        return (
          <td key={college.id} className="p-4 md:p-8 text-center">
            <span className="text-sm md:text-xl font-bold text-slate-900">
              {(rate * 100).toFixed(1)}%
            </span>
            <span
              className={`block text-[8px] md:text-[9px] font-black uppercase mt-1 md:mt-1.5 px-1.5 md:px-2 py-0.5 rounded-md mx-auto w-max ${
                isHighlyCompetitive
                  ? "bg-red-50 text-red-600"
                  : isCompetitive
                    ? "bg-orange-50 text-orange-600"
                    : "bg-blue-50 text-blue-600"
              }`}
            >
              {isHighlyCompetitive ? "Selective" : isCompetitive ? "Competitive" : "Match"}
            </span>
          </td>
        );
      })}
    </tr>
  );
}
