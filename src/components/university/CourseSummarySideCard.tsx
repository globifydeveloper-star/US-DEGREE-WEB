import React from 'react';
import { Info } from 'lucide-react';

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
    <div className="w-full shrink-0">
      <div className="flex items-start gap-2 text-[10px] text-slate-500 mb-4 px-2">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span className="leading-tight">
          Source: Information is based on publicly available data from official U.S. Department of Education sources, including IPEDS, College Scorecard, and College Navigator.
        </span>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-5">Course Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-slate-500">Degree</span>
            <span className="text-sm font-semibold text-slate-900 text-right">{degree}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-slate-500">Duration</span>
            <span className="text-sm font-semibold text-slate-900">{duration}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-slate-500">Format</span>
            <span className="text-sm font-semibold text-slate-900">{format}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500">Financial Aid</span>
            <span className="text-sm font-semibold text-emerald-600">{financialAid}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Apply Now
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            Next intake: Fall 2025 · Deadline: Jan 5, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
