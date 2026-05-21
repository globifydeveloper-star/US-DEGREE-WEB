import React from 'react';

interface AdmissionsOverviewProps {
  admissionRate: string;
  applicants: string;
  satReadingWriting: string;
  satMath: string;
  satAverage: string;
  salaryYear1?: number | string | null;
  salaryYear10?: number | string | null;
  netRoi20Yr?: number | string | null;
  growthRate?: number | string | null;
}

const parseDisplayNumber = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

const formatDisplayNumber = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "N/A";
  }

  return Math.round(value).toLocaleString();
};

const formatCurrency = (value: number | string | null | undefined, compact = false) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  if (compact && numericValue >= 1000000) {
    return `$${(numericValue / 1000000).toFixed(1)}M`;
  }

  if (compact && numericValue >= 1000) {
    return `$${Math.round(numericValue / 1000)}K`;
  }

  return `$${Math.round(numericValue).toLocaleString()}`;
};

const formatPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  const percentValue = numericValue < 2 ? numericValue * 100 : numericValue;
  return `${percentValue.toFixed(1).replace(/\.0$/, "")}%`;
};

export default function AdmissionsOverview({
  admissionRate,
  applicants,
  satReadingWriting,
  satMath,
  satAverage,
  salaryYear1,
  salaryYear10,
  netRoi20Yr,
  growthRate
}: AdmissionsOverviewProps) {
  const admissionRateValue = parseFloat(admissionRate);
  const parsedAdmissionRate = isNaN(admissionRateValue) ? 0 : admissionRateValue;
  const acceptedApplicants = parseDisplayNumber(applicants);
  const estimatedTotalApplicants = parsedAdmissionRate > 0
    ? acceptedApplicants / (parsedAdmissionRate / 100)
    : 0;
  const hasOutcomeSummary = [salaryYear1, salaryYear10, netRoi20Yr, growthRate].some(
    (value) => value !== null && value !== undefined
  );

  const outcomeCards = [
    {
      eyebrow: "Median salary in 10th year",
      value: `${formatCurrency(salaryYear10)}+`,
      color: "text-[#14C8A0]",
    },
    {
      eyebrow: "Median salary in 1st year",
      value: formatCurrency(salaryYear1),
      color: "text-[#4A9BC9]",
    },
    {
      eyebrow: "20-year net ROI",
      value: formatCurrency(netRoi20Yr, true),
      color: "text-[#A669F2]",
    },
    {
      eyebrow: "Growth rate",
      value: formatPercent(growthRate),
      color: "text-[#FF5A5A]",
    },
  ];

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-7">
        <h2 className="text-2xl font-extrabold text-slate-900 inline-block w-fit border-b-[6px] border-slate-900 pb-1 leading-none">
          Admissions Overview
        </h2>
        <div className="flex items-center gap-1 text-[10px] italic text-slate-400">
          <span>Source: An official website of the United States government</span>
          <span className="cursor-help text-slate-300" title="Source information">i</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(260px,0.95fr)_minmax(320px,1fr)] lg:items-start">
        <div className="bg-slate-50 rounded-[24px] min-h-[240px] px-8 py-10 flex flex-col items-center justify-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#CBD5E1" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#2563EB"
                strokeWidth="10"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 * (1 - parsedAdmissionRate / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-2xl font-black text-slate-900">{admissionRate}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {parsedAdmissionRate > 0
              ? parsedAdmissionRate < 30
                ? 'Highly Competitive'
                : parsedAdmissionRate < 70
                ? 'Selective'
                : 'Open Admission'
              : 'Admission Rate'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 mb-4">
              <span>SAT Evidence-Based Reading & Writing</span>
              <span>{satReadingWriting}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600" style={{ width: '68%' }} />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 mb-4">
              <span>SAT Math</span>
              <span>{satMath}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 mb-4">
              <span>SAT Average</span>
              <span>{satAverage}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 w-[90%]" />
            </div>
          </div>
        </div>
      </div>

      {parsedAdmissionRate > 0 && acceptedApplicants > 0 && (
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Estimated {formatDisplayNumber(estimatedTotalApplicants)} applicants, with {formatDisplayNumber(acceptedApplicants)} accepted.
        </p>
      )}

      {hasOutcomeSummary && (
        <div className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {outcomeCards.map((card) => (
              <div key={card.eyebrow} className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                <p className={`text-3xl font-black leading-none ${card.color}`}>{card.value}</p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.eyebrow}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
