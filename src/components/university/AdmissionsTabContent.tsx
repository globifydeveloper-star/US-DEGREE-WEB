import React from 'react';

interface AdmissionsTabContentProps {
  name: string;
  admissionRate: string;
  applicants: string;
  satReadingWriting: string;
  satMath: string;
  satAverage: string;
}

const parseRange = (rangeStr: string, defaultMin: number, defaultMax: number) => {
  if (!rangeStr || rangeStr === 'N/A') return { min: defaultMin, max: defaultMax };
  const parts = rangeStr.split('-').map((p) => parseInt(p.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { min: parts[0], max: parts[1] };
  }
  return { min: defaultMin, max: defaultMax };
};

export default function AdmissionsTabContent({
  name,
  admissionRate,
  applicants,
  satReadingWriting,
  satMath,
  satAverage,
}: AdmissionsTabContentProps) {
  const rateValue = parseFloat(admissionRate);
  const parsedRate = isNaN(rateValue) ? 0 : rateValue;

  const percentage = Math.min(Math.max(parsedRate, 0), 100);
  const strokeWidth = 14;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const competitiveness =
    parsedRate > 0
      ? parsedRate < 15
        ? 'Highly Competitive'
        : parsedRate < 50
          ? 'Selective'
          : 'Open Admission'
      : 'Admission Rate';

  // Dynamic description matching selectivity
  const description =
    parsedRate > 0
      ? parsedRate < 15
        ? `${name}'s admissions process is extremely selective, ranking as one of the most difficult universities to enter globally.`
        : parsedRate < 50
          ? `${name}'s admissions process is highly selective, evaluating applicants on rigorous academic standards and holistic metrics.`
          : `${name} maintains an open or highly accessible admissions policy, welcoming a broad and diverse student population.`
      : `${name} admissions process and student enrollment parameters.`;

  // Parse SAT Reading & Writing and Math ranges
  const rwRange = parseRange(satReadingWriting, 600, 750);
  const mathRange = parseRange(satMath, 600, 750);
  const satMin = rwRange.min + mathRange.min;
  const satMax = rwRange.max + mathRange.max;

  // Calculate SAT bar offsets
  // SAT score spans from 400 to 1600 (total range = 1200)
  const satLeft = Math.max(0, Math.min(100, ((satMin - 400) / 1200) * 100));
  const satWidth = Math.max(5, Math.min(100 - satLeft, ((satMax - satMin) / 1200) * 100));

  // Determine ACT composite range based on competitiveness fallbacks
  let actMin = 21;
  let actMax = 26;
  if (parsedRate > 0) {
    if (parsedRate < 15) {
      actMin = 34;
      actMax = 35;
    } else if (parsedRate < 50) {
      actMin = 28;
      actMax = 32;
    } else {
      actMin = 18;
      actMax = 24;
    }
  }

  // Calculate ACT bar offsets
  // ACT composite spans from 1 to 36 (total range = 35)
  const actLeft = Math.max(0, Math.min(100, ((actMin - 1) / 35) * 100));
  const actWidth = Math.max(5, Math.min(100 - actLeft, ((actMax - actMin) / 35) * 100));

  return (
    <div className="flex flex-col gap-16 py-4 max-w-4xl">
      
      {/* 1. Acceptance Rate Section */}
      <div className="flex flex-col gap-8">
        <h2 className="text-[28px] font-semibold text-[#F7221F] font-['Poppins'] leading-none">
          Acceptance Rate
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Circular progress container */}
          <div 
            style={{ width: 170, height: 170 }} 
            className="relative flex items-center justify-center shrink-0"
          >
            <svg width="170" height="170" viewBox="0 0 170 170" className="w-full h-full">
              {/* Gray background track with white inner fill */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="white"
                stroke="#CBD5E1"
                strokeWidth={strokeWidth}
              />
              {/* Blue active progress segment */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                stroke="#2054FE"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 85 85)"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-3xl font-black text-[#0F172A] font-['Lexend'] border-b-[3px] border-[#0F172A] pb-0.5 leading-none">
              {admissionRate}
            </span>
          </div>

          {/* Badge & Description */}
          <div className="flex flex-col items-start gap-4">
            <div className="px-5 py-2.5 bg-[#2054FE] rounded-full inline-flex">
              <span className="text-sm font-bold text-white uppercase tracking-wider font-['Poppins']">
                {competitiveness}
              </span>
            </div>
            <p className="text-lg text-slate-500 font-['Poppins'] leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Standardized Test Scores Section */}
      <div className="flex flex-col gap-10">
        <h2 className="text-[28px] font-semibold text-[#F7221F] font-['Poppins'] leading-none">
          Standardized Test Scores (25th-75th Percentile)
        </h2>

        <div className="flex flex-col gap-10 max-w-[1200px]">
          {/* SAT Range Row */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-lg font-medium font-['Poppins']">
              <span className="text-slate-600">SAT Score Range</span>
              <span className="font-bold text-slate-900">{satMin} — {satMax}</span>
            </div>
            {/* Slider track */}
            <div className="relative h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
              <div 
                className="absolute h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB]"
                style={{ left: `${satLeft}%`, width: `${satWidth}%` }}
              />
            </div>
            {/* Range Labels */}
            <div className="flex justify-between text-xs font-bold text-slate-400 font-['Poppins']">
              <span>400</span>
              <span>1600</span>
            </div>
          </div>

          {/* ACT Range Row */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-lg font-medium font-['Poppins']">
              <span className="text-slate-600">ACT Composite Range</span>
              <span className="font-bold text-slate-900">{actMin} — {actMax}</span>
            </div>
            {/* Slider track */}
            <div className="relative h-3.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
              <div 
                className="absolute h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#2563EB]"
                style={{ left: `${actLeft}%`, width: `${actWidth}%` }}
              />
            </div>
            {/* Range Labels */}
            <div className="flex justify-between text-xs font-bold text-slate-400 font-['Poppins']">
              <span>1</span>
              <span>36</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
