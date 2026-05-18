import React from 'react';

interface AdmissionsOverviewProps {
  admissionRate: string;
  applicants: string;
  satReadingWriting: string;
  satMath: string;
  satAverage: string;
}

const parseDisplayNumber = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

const formatDisplayNumber = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "N/A";
  }

  return Math.round(value).toLocaleString();
};

export default function AdmissionsOverview({
  admissionRate, applicants, satReadingWriting, satMath, satAverage
}: AdmissionsOverviewProps) {
  const admissionRateValue = parseFloat(admissionRate);
  const acceptedApplicants = parseDisplayNumber(applicants);
  const estimatedTotalApplicants = admissionRateValue > 0
    ? acceptedApplicants / (admissionRateValue / 100)
    : 0;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 inline-block border-b-[6px] border-black pb-1 leading-none">
          Admissions Overview
        </h2>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span>Source: An official website of the United States government</span>
          <span className="cursor-help text-gray-300" title="Source information">i</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-16">
        {/* Left: Admission Rate */}
        <div className="flex-1 max-w-sm bg-[#F9FAFB] rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="#3B82F6" strokeWidth="12"
                strokeDasharray="339.292"
                strokeDashoffset={339.292 * (1 - admissionRateValue / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-4xl font-black text-gray-900">{admissionRate}</span>
          </div>
          <p className="text-sm font-black text-gray-900 mb-1 uppercase tracking-wider">Highly Competitive</p>
          <p className="text-[11px] text-blue-600 font-bold underline cursor-pointer decoration-2 underline-offset-2">
            Only {formatDisplayNumber(acceptedApplicants)} accepted of {formatDisplayNumber(estimatedTotalApplicants)}
          </p>
        </div>

        {/* Right: SAT Stats */}
        <div className="flex-[1.5] flex flex-col gap-8 pt-4">
          {/* SAT Reading & Writing */}
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black text-gray-900 uppercase tracking-wider">
              <span className="border-b-2 border-blue-600">SAT Evidence-Based Reading & Writing</span>
              <span className="border-b-2 border-blue-600">{satReadingWriting}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%', marginLeft: '45%' }}></div>
            </div>
          </div>

          {/* SAT Math */}
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black text-gray-900 uppercase tracking-wider">
              <span className="border-b-2 border-blue-600">SAT Math</span>
              <span className="border-b-2 border-blue-600">{satMath}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '45%', marginLeft: '40%' }}></div>
            </div>
          </div>

          {/* SAT Average */}
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black text-gray-900 uppercase tracking-wider">
              <span className="border-b-2 border-blue-600">SAT Average ( Overall )</span>
            </div>
            <p className="text-sm font-black text-gray-900">{satAverage}</p>
            <div className="h-2 bg-blue-600 rounded-full w-full"></div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-700">
              <div className="w-2.5 h-2.5 border-2 border-emerald-400 rotate-45 shrink-0"></div>
              <span>Common Application Required</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-700">
              <div className="w-2.5 h-2.5 border-2 border-emerald-400 rotate-45 shrink-0"></div>
              <span>2 Letters of Recommendation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
