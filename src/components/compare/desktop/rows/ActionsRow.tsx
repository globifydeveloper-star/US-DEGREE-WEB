"use client";

import { College } from "@/types/university/ComparisonTable";
import ActionButtons from "../../shared/ActionButtons";

interface ActionsRowProps {
  colleges: College[];
  onViewDetails: (id: string) => void;
}

export default function ActionsRow({ colleges, onViewDetails }: ActionsRowProps) {
  return (
    <tr className="bg-[#FAFBFD]/30">
      <td className="p-4 md:p-8 sticky left-0 bg-[#FAFBFD]/90 backdrop-blur font-black text-slate-700 z-10 border-r border-gray-100">
        <div>
          <p className="font-bold text-slate-800 text-xs md:text-sm">Action Details</p>
          <p className="text-[8px] md:text-[10px] font-medium text-gray-400 mt-0.5">
            Deep-dive studies, reviews
          </p>
        </div>
      </td>
      {colleges.map((college) => (
        <td key={college.id} className="p-4 md:p-8 text-center bg-slate-50/20">
          <ActionButtons
            schoolUrl={college.schoolUrl}
            onViewDetails={() => onViewDetails(college.id)}
            layout="desktop"
          />
        </td>
      ))}
    </tr>
  );
}
