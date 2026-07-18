"use client";

import { Tooltip } from "antd";
import { College } from "@/types/university/ComparisonTable";
import DesktopRowLabel from "../DesktopRowLabel";

interface ProgramRowProps {
  colleges: College[];
}

export default function ProgramRow({ colleges }: ProgramRowProps) {
  return (
    <tr className="hover:bg-slate-50/30 transition-colors">
      <DesktopRowLabel title="Program Details" subtitle="Compared program, credential level & CIP code" />
      {colleges.map((college) => (
        <td key={college.id} className="p-4 md:p-8 text-center font-mono">
          {college.programName ? (
            <Tooltip title={college.programName}>
              <div className="flex flex-col items-center max-w-[120px] md:max-w-[160px] mx-auto">
                <span className="text-xs md:text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                  {college.programName}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1 md:mt-1.5">
                  {college.credentialTitle && (
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-1.5 md:px-2 py-0.5 rounded-md border border-emerald-100">
                      {college.credentialTitle}
                    </span>
                  )}
                  {college.cipCode && college.cipCode !== "default" && (
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#3F51B5] bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-md border border-blue-100">
                      CIP: {college.cipCode}
                    </span>
                  )}
                </div>
              </div>
            </Tooltip>
          ) : (
            <span className="text-sm md:text-xl font-bold text-slate-400">N/A</span>
          )}
        </td>
      ))}
    </tr>
  );
}
