import React from 'react';
import { OutcomesSectionProps } from "@/types/outcomes-section"

export default function OutcomesSection({
  salaryYear1,
  salaryYear5,
  salaryYear10,
  netRoi20Yr,
  growthRate,
  empFactor,
  debtIncomeRatio,
  programTitle
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
    return `${Math.round(pct)}%`;
  };

  const parseNumber = (val: number | string | null | undefined): number => {
    if (val === null || val === undefined) return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // 1. Median Salary values
  // AFTER
  const s1 = salaryYear1 != null ? parseNumber(salaryYear1) : null;
  const s5 = salaryYear5 != null ? parseNumber(salaryYear5) : null;
  const s10 = salaryYear10 != null ? parseNumber(salaryYear10) : null;

  // 2. Employment Rate
  const parsedEmp = parseNumber(empFactor) || 0.94;

  // 3. Debt to Income calculations
  const rawRatio = parseNumber(debtIncomeRatio) || 0.40;
  // Multiplier is 1 / ratio, e.g. 1 / 0.4 = 2.5
  const multiplier = rawRatio > 0 ? (1 / rawRatio).toFixed(1) : "2.5";

  // Early-career salary (1st year earnings or fallback to $45k if very low)
  const earlyEarnings = s1 != null && s1 > 20000 ? s1 : 45000;
  // Average debt = earlyEarnings * rawRatio
  const avgDebt = Math.round(earlyEarnings * rawRatio);

  // 4. Projected Salary Trajectory SVG Calculations
  const hasSalaryData = s1 !== null || s5 !== null || s10 !== null;

  const s1Val = s1 ?? (s5 ? Math.round(s5 / 1.3) : (s10 ? Math.round(s10 / 1.6) : 40000));
  const s5Val = s5 ?? Math.round(s1Val * 1.3);
  const s10Val = s10 ?? Math.round(s5Val * 1.25);
  const s15Val = Math.round(s10Val * 1.25);
  const s20Val = Math.round(s10Val * 1.5);

  const trajectoryPoints = [
    { label: "ENTRY", val: s1Val },
    { label: "YEAR 5", val: s5Val },
    { label: "YEAR 10", val: s10Val },
    { label: "YEAR 15", val: s15Val },
    { label: "YEAR 20", val: s20Val },
  ];

  // SVG dimensions
  const width = 600;
  const height = 220;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxVal = s20Val * 1.1;
  const minVal = s1Val * 0.8;
  const diffVal = maxVal - minVal;
  const safeDiff = diffVal === 0 ? 1 : diffVal;

  // Map values to coordinates
  const coords = trajectoryPoints.map((pt, i) => {
    const x = paddingLeft + (i * (width - paddingLeft - paddingRight) / (trajectoryPoints.length - 1));
    const y = height - paddingBottom - ((pt.val - minVal) * (height - paddingTop - paddingBottom) / safeDiff);
    return { x, y };
  });

  // Build SVG path using cubic bezier for smooth curves
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 3;
    const cpY1 = curr.y;
    const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  // Path for gradient fill underneath
  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  // 5. In-Demand Roles lists tailored to program titles
  const isBusiness = programTitle?.toLowerCase().includes("bus") || programTitle?.toLowerCase().includes("fin") || programTitle?.toLowerCase().includes("econ");
  const isHealth = programTitle?.toLowerCase().includes("health") || programTitle?.toLowerCase().includes("bio") || programTitle?.toLowerCase().includes("nurs");

  const roles = isBusiness
    ? ["Investment Banker", "Financial Analyst", "Consultant", "Product Manager", "Business Analyst", "Operations Manager"]
    : isHealth
      ? ["Clinical Research Associate", "Healthcare Administrator", "Medical Technologist", "Bioinformatics Specialist", "Consultant"]
      : ["Software Engineer", "Product Manager", "Data Scientist", "Investment Banker", "Consultant", "UX Designer"];

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl">

      {/* 1. Median Salary Section */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-4">MEDIAN SALARY</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1 Year */}
          <div className="bg-[#FEF9C3]/80 border border-yellow-100 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 mb-1">1 Year</p>
            <p className="text-3xl font-black text-[#16A34A] tracking-tight">
              {s1 != null ? formatCurrency(s1) : <span className="text-gray-300 text-xl">No data</span>}
            </p>
          </div>

          {/* 5 Year */}
          <div className="bg-[#FEE2E2]/80 border border-red-100 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 mb-1">5 Year</p>
            <p className="text-3xl font-black text-[#16A34A] tracking-tight">
              {s5 != null ? formatCurrency(s5) : <span className="text-gray-300 text-xl">No data</span>}
            </p>
          </div>

          {/* 10 Year */}
          <div className="bg-[#EEF2FF]/80 border border-indigo-100 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 mb-1">10 Year</p>
            <p className="text-3xl font-black text-[#16A34A] tracking-tight">
              {s10 != null ? formatCurrency(s10) : <span className="text-gray-300 text-xl">No data</span>}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Employment Rate & ROI Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Employment Rate */}
        <div className="bg-[#F0FDF4] border border-[#DCFCE7]/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-[#16A34A] uppercase tracking-[0.1em] mb-2">EMPLOYMENT RATE</p>
            <p className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
              {formatPercent(parsedEmp)}
            </p>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full mt-2">
            <div
              className="bg-[#2563EB] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${parsedEmp < 2 ? parsedEmp * 100 : parsedEmp}%` }}
            />
          </div>
        </div>

        {/* 20-Year ROI */}
        <div className="bg-[#FDF4FF] border border-[#F5D0FE]/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-[#C084FC] uppercase tracking-[0.1em] mb-2">20-YEAR NET ROI</p>
            <p className="text-5xl font-black text-[#2563EB] tracking-tighter mb-1">
              {formatRoi(netRoi20Yr || 2100000)}
            </p>
            <p className="text-xs text-gray-400 font-medium">Lifetime earnings premium</p>
          </div>
        </div>
      </div>

      {/* 3. Salary Trajectory Line Graph */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Salary Trajectory</h2>
        <div className="bg-white border border-gray-150 rounded-3xl p-6.5 shadow-sm">
          {hasSalaryData ? (
            <>
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full min-w-[500px] h-auto overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y Axis Grid Lines & Labels */}
                  {[minVal, (minVal + maxVal) / 2, maxVal].map((yVal, i) => {
                    const y = height - paddingBottom - ((yVal - minVal) * (height - paddingTop - paddingBottom) / safeDiff);
                    return (
                      <g key={i}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={width - paddingRight}
                          y2={y}
                          stroke="#F3F4F6"
                          strokeWidth="1.5"
                        />
                        <text
                          x={paddingLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] font-black text-gray-400"
                        >
                          {formatCurrency(yVal)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Curve Area Fill */}
                  <path d={fillD} fill="url(#chartGradient)" />

                  {/* Curve Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Data points */}
                  {coords.map((coord, i) => (
                    <circle
                      key={i}
                      cx={coord.x}
                      cy={coord.y}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                    />
                  ))}

                  {/* X Axis Labels */}
                  {coords.map((coord, i) => (
                    <text
                      key={i}
                      x={coord.x}
                      y={height - paddingBottom + 18}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-gray-400 uppercase tracking-wider"
                    >
                      {trajectoryPoints[i].label}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Projected Growth</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28m0 0a3 3 0 10-3-3M3.75 21h16.5" />
              </svg>
              <p className="text-sm font-semibold text-gray-500">Salary trajectory data is not available for this program</p>
              <p className="text-[11px] text-gray-400 mt-1">Estimates will populate once federal scorecard updates are released.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. In-Demand Roles */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">In-Demand Roles</h2>
        <div className="flex flex-wrap gap-2.5">
          {roles.map((role, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors rounded-full text-xs font-semibold cursor-default"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* 5. Debt-to-Income Ratio */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Debt-to-Income Ratio</h2>
        <div className="bg-white border border-gray-150 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="px-3 py-1.5 bg-[#E0F2FE] text-[#0369A1] rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              {Number(multiplier) >= 2.0 ? "HIGH ROI POTENTIAL" : "GOOD VALUE"}
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              1:{multiplier} Debt-to-income
            </span>
          </div>

          {/* Dynamic ratio bar */}
          <div className="w-full h-8 rounded-xl overflow-hidden flex font-bold text-[10px] text-white">
            <div
              className="bg-[#EF4444] flex items-center justify-center transition-all duration-500"
              style={{ width: `${rawRatio * 100}%` }}
            >
              Debt
            </div>
            <div
              className="bg-[#2563EB] flex items-center justify-center flex-1 transition-all duration-500"
            >
              Income
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900">{formatCurrency(avgDebt)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average debt</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-black text-gray-900">{formatCurrency(earlyEarnings)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average early-career earnings</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center font-medium border-t border-gray-50 pt-4">
            Students typically earn ~{multiplier}x their debt after graduation
          </p>
        </div>
      </div>

    </div>
  );
}
