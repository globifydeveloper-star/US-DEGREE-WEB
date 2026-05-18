import React from 'react';
import { Info } from 'lucide-react';

interface CourseSummarySideCardProps {
  degree: string;
  duration: string;
  format: string;
  financialAid: string;
}

export default function CourseSummarySideCard({
  degree, duration, format, financialAid
}: CourseSummarySideCardProps) {
  return (
    <div className="w-full shrink-0">
      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4 px-2">
        <Info size={12} className="shrink-0" />
        <span className="leading-tight">Source: Information is based on publicly available data from official U.S. Department of Education sources, including IPEDS, College Scorecard, and College Navigator.</span>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Course Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Degree</span>
            <span className="text-sm font-bold text-gray-900 text-right">{degree}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Duration</span>
            <span className="text-sm font-bold text-gray-900">{duration}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Format</span>
            <span className="text-sm font-bold text-gray-900 text-right">{format}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Financial Aid</span>
            <span className="text-sm font-bold text-green-600">{financialAid}</span>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-2">
          <button className="w-full bg-[#83449F] hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl transition-colors">
            Apply Now
          </button>
          <p className="text-[9px] text-gray-400 text-center">Next intake: Fall 2025 &bull; Deadline: Jan 5, 2025</p>
        </div>
      </div>
    </div>
  );
}
