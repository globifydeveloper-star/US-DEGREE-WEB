import React from 'react';
import { HelpCircle } from 'lucide-react';

interface CourseSummarySideCardProps {
  degree: string;
  duration: string;
  format: string;
  financialAid: string;
}

export default function CourseSummarySideCard({
  degree,
  duration,
  format,
  financialAid,
}: CourseSummarySideCardProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Citation Above Card */}


      {/* Main Course Summary Card */}
      <div className="bg-white border border-[#EAEFF5] rounded-[32px] shadow-sm p-8 flex flex-col gap-6">
        <h3 className="text-[20px] font-black text-slate-900 tracking-tight leading-none">
          Course Summary
        </h3>

        <div className="flex flex-col">
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-400">Degree</span>
            <span className="text-sm font-black text-slate-900 text-right max-w-[200px] leading-tight">
              {degree}
            </span>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-400">Duration</span>
            <span className="text-sm font-black text-slate-900">{duration}</span>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-400">Format</span>
            <span className="text-sm font-black text-slate-900">{format}</span>
          </div>
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-semibold text-slate-400">Financial Aid</span>
            <span className="text-sm font-black text-emerald-500">{financialAid}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button className="w-full rounded-[16px] bg-gradient-to-r from-[#2b55ff] to-[#9333ea] py-4 text-[15px] font-black text-white hover:opacity-95 hover:shadow-lg active:scale-[0.99] transition-all shadow-md shadow-blue-500/10">
            Apply Now
          </button>

        </div>
      </div>
      <div className="flex items-start gap-1.5 text-[11px] text-slate-400 leading-tight px-1 select-none">
        <HelpCircle size={13} className="text-slate-400 mt-0.5 shrink-0" />
        <span>
          Source: Information is based on publicly available data from official U.S. Department of Education sources, including IPEDS, College Scorecard, and College Navigator.
        </span>
      </div>
    </div>
  );
}

