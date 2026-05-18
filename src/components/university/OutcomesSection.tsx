import React from 'react';

interface OutcomesSectionProps {
  salaryYear1?: number | string | null;
  salaryYear10?: number | string | null;
  netRoi20Yr?: number | string | null;
  growthRate?: number | string | null;
  empFactor?: number | string | null;
  debtIncomeRatio?: number | string | null;
}

export default function OutcomesSection({
  salaryYear1,
  salaryYear10,
  netRoi20Yr,
  growthRate,
  empFactor,
  debtIncomeRatio
}: OutcomesSectionProps) {
  const formatCurrency = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `$${Math.round(num).toLocaleString()}`;
  };

  const formatRoi = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${Math.round(num).toLocaleString()}`;
  };

  const formatPercent = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined) return "N/A";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    const pct = num < 2 ? num * 100 : num;
    return `${pct.toFixed(1)}%`;
  };

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Median Salary 10th Year */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-5xl font-black text-[#00C091] tracking-tighter mb-2">
            {formatCurrency(salaryYear10)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Median Salary in 10th Year</p>
        </div>

        {/* Median Salary 1st Year */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-5xl font-black text-[#38BDF8] tracking-tighter mb-2">
            {formatCurrency(salaryYear1)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Median Salary in 1st Year</p>
        </div>

        {/* Lifetime Earnings / ROI */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.1em] mb-2">20-Year Net ROI</p>
          <p className="text-5xl font-black text-[#A855F7] tracking-tighter mb-2">
            {formatRoi(netRoi20Yr)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Lifetime Earnings Premium</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-5xl font-black text-[#F43F5E] tracking-tighter mb-2">
            {formatPercent(growthRate)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Growth Rate (1st to 10th Year)</p>
        </div>

        {/* Employment Factor */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-5xl font-black text-[#6366F1] tracking-tighter mb-2">
            {formatPercent(empFactor)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Employment Rate (Emp. Factor)</p>
        </div>

        {/* Debt-to-Income Ratio */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm flex flex-col justify-center">
          <p className="text-5xl font-black text-[#F59E0B] tracking-tighter mb-2">
            {formatPercent(debtIncomeRatio)}
          </p>
          <p className="text-[11px] font-black text-[#475569] uppercase tracking-[0.1em]">Debt-to-Income Ratio</p>
        </div>
      </div>
    </div>
  );
}
