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

const parseDisplayNumber = (value: string) => Number(value.replace(/[^0-9.]/g, ''));

const formatDisplayNumber = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return 'N/A';
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatCurrency = (value: number | string | null | undefined, compact = false): string => {
  if (value === null || value === undefined) return 'N/A';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  // Use regex instead of toLocaleString to avoid server/client locale mismatch
  const parts = Math.round(n).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts[0];
};

const formatPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const pct = n < 2 ? n * 100 : n;
  return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
};

interface ScoreBarProps {
  label: string;
  range: string;
  percent: number;
}

function ScoreBar({ label, range, percent }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800 font-['Lexend'] border-b-[2px] border-[#2054FE] pb-0.5 inline-block">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-800 font-['Lexend'] border-b-[2px] border-[#2054FE] pb-0.5 inline-block">
          {range}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full bg-[#2054FE]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdmissionsOverview({
  admissionRate,
  applicants,
  satReadingWriting,
  satMath,
  satAverage,
  salaryYear1,
  salaryYear10,
  netRoi20Yr,
  growthRate,
}: AdmissionsOverviewProps) {
  const admissionRateValue = parseFloat(admissionRate);
  const parsedRate = isNaN(admissionRateValue) ? 0 : admissionRateValue;
  const acceptedApplicants = parseDisplayNumber(applicants);
  const estimatedTotal = parsedRate > 0 ? acceptedApplicants / (parsedRate / 100) : 0;

  const effectiveSalaryYear1 = salaryYear1 || 91200;
  const effectiveSalaryYear10 = salaryYear10 || 149696;
  const effectiveNetRoi = netRoi20Yr || 2100000;
  const effectiveGrowthRate = growthRate || 62.5;

  const competitiveness =
    parsedRate > 0
      ? parsedRate < 30
        ? 'Highly Competitive'
        : parsedRate < 70
          ? 'Selective'
          : 'Open Admission'
      : 'Admission Rate';

  const outcomeCards = [
    {
      label: 'MEDIAN SALARY IN 10th YEAR',
      value: `${formatCurrency(effectiveSalaryYear10)}+`,
      color: '#0AC69D',
    },
    {
      label: 'MEDIAN SALARY IN 1st YEAR',
      value: formatCurrency(effectiveSalaryYear1),
      color: '#45A0D0',
    },
    {
      eyebrow: '20-YEAR NET ROI',
      label: 'LIFETIME EARNINGS PREMIUM',
      value: formatCurrency(effectiveNetRoi, true),
      color: '#AB61FF',
    },
    {
      label: 'GROWTH RATE',
      value: formatPercent(effectiveGrowthRate),
      color: '#F75659',
    },
  ];

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-7">
        <h2 className="text-[28px] font-bold text-slate-900 font-['Lexend'] inline-block border-b-[3px] border-slate-900 pb-1 leading-none">
          Admissions Overview
        </h2>
        <p className="text-[10px] italic text-slate-400">
          Source: An official website of the United States government
        </p>
      </div>

      {/* Acceptance + SAT grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        {/* Circle card */}
        <div className="bg-[#F8FAFC] rounded-[20px] flex flex-col items-center justify-center gap-5 py-12 px-8">
          <div className="w-[170px] h-[170px] rounded-full bg-[#2054FE] flex items-center justify-center">
            <span className="text-4xl font-black text-white font-['Lexend']">{admissionRate}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 font-['Lexend'] border-b-[2px] border-slate-900 pb-0.5 inline-block">
            {competitiveness}
          </p>
        </div>

        {/* SAT bars */}
        <div className="flex flex-col gap-6 justify-center">
          <ScoreBar label="SAT Evidence-Based Reading & Writing" range={satReadingWriting} percent={68} />
          <ScoreBar label="SAT Math" range={satMath} percent={72} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-800 font-['Lexend'] border-b-[2px] border-[#2054FE] pb-0.5 inline-block">
              SAT Average (Overall)
            </span>
            <span className="text-base font-black text-slate-900 font-['Lexend'] border-b-[2px] border-[#2054FE] pb-0.5 inline-block w-fit">
              {satAverage}
            </span>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#2054FE] w-[90%]" />
            </div>
          </div>
        </div>
      </div>

      {parsedRate > 0 && acceptedApplicants > 0 && (
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Estimated {formatDisplayNumber(estimatedTotal)} applicants, with{' '}
          {formatDisplayNumber(acceptedApplicants)} accepted.
        </p>
      )}

      {/* Outcomes card */}
      {/* Outcomes card */}
      <div
        className="mt-10 bg-white w-full p-[58px]"
        style={{
          borderRadius: 27,
          boxShadow: '0px 2px 3px rgba(0,0,0,0.05)',
          outline: '3.41px #F1F5F9 solid',
          outlineOffset: '-3.41px',
        }}
      >
        <div className="grid grid-cols-2 gap-8">

          {/* Median Salary 10th Year */}
          <div
            className="bg-white flex flex-col justify-between p-6"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 147 }}
          >
            <p className="text-5xl font-black leading-none font-lexend" style={{ color: '#0AC69D' }}>
              {formatCurrency(effectiveSalaryYear10)}+
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-lexend mt-3">
              Median Salary in 10<span className="align-super text-[8px]">th</span> Year
            </p>
          </div>

          {/* Median Salary 1st Year */}
          <div
            className="bg-white flex flex-col justify-between p-6"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 147 }}
          >
            <p className="text-5xl font-black leading-none font-lexend" style={{ color: '#45A0D0' }}>
              {formatCurrency(effectiveSalaryYear1)}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Median Salary in 1<span className="align-super text-[8px]">st</span> Year
            </p>
          </div>

          {/* 20-Year Net ROI */}
          <div
            className="bg-white flex flex-col justify-between p-6"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 156 }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins mb-2">
              20-Year Net ROI
            </p>
            <p className="text-5xl font-black leading-none font-poppins" style={{ color: '#AB61FF' }}>
              {formatCurrency(effectiveNetRoi, true)}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Lifetime Earnings Premium
            </p>
          </div>

          {/* Growth Rate */}
          <div
            className="bg-white flex flex-col justify-between p-6"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 156 }}
          >
            <p className="text-5xl font-black leading-none font-poppins" style={{ color: '#F75659' }}>
              {formatPercent(effectiveGrowthRate)}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Growth Rate
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}