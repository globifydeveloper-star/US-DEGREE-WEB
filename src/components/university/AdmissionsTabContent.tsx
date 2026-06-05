"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AdmissionsTabContentProps } from '@/types/university/AdmissionsTabContent';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1000;
          const steps = 60;
          const stepTime = duration / steps;
          let step = 0;

          const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setAnimProgress(eased);

            if (step >= steps) {
              clearInterval(timer);
              setAnimProgress(1);
            }
          }, stepTime);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const rateValue = parseFloat(admissionRate);
  const parsedRate = isNaN(rateValue) ? 0 : rateValue;

  // SVG ring values
  const strokeWidth = 16;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(parsedRate, 0), 100);
  const strokeDashoffset = circumference - (percentage * animProgress / 100) * circumference;

  const competitiveness =
    parsedRate > 0
      ? parsedRate < 15
        ? 'Highly Competitive'
        : parsedRate < 50
          ? 'Selective'
          : 'Open Admission'
      : 'Admission Rate';

  const description =
    parsedRate > 0
      ? parsedRate < 15
        ? `${name}'s admissions process is extremely selective, ranking as one of the most difficult universities to enter globally.`
        : parsedRate < 50
          ? `${name}'s admissions process is highly selective, evaluating applicants on rigorous academic standards and holistic metrics.`
          : `${name} maintains an open or highly accessible admissions policy, welcoming a broad and diverse student population.`
      : `${name} admissions process and student enrollment parameters.`;

  // SAT bar — convert Figma pixel positions to %
  // Total width: 1201.77, bar left: 841.22, bar width: 300.48
  const satLeft = (841.22 / 1201.77) * 100; // ~70%
  const satWidth = (300.48 / 1201.77) * 100; // ~25%

  // ACT bar — Total width: 1201.77, bar left: 1021.49, bar width: 120.21
  const actLeft = (1021.49 / 1201.77) * 100; // ~85%
  const actWidth = (120.21 / 1201.77) * 100;  // ~10%

  // Dynamic SAT range from props
  const rwRange = parseRange(satReadingWriting, 0, 0);
  const mathRange = parseRange(satMath, 0, 0);
  const satMin = rwRange.min + mathRange.min;
  const satMax = rwRange.max + mathRange.max;
  const hasSatData = satMin > 0 && satMax > 0;

  // Dynamic SAT bar from actual data
  const dynSatLeft = hasSatData ? Math.max(0, Math.min(90, ((satMin - 400) / 1200) * 100)) : 0;
  const dynSatWidth = hasSatData ? Math.max(10, Math.min(100 - dynSatLeft, ((satMax - satMin) / 1200) * 100)) : 0;

  // Dynamic ACT
  let actMin = 21, actMax = 26;
  if (parsedRate > 0) {
    if (parsedRate < 15) { actMin = 34; actMax = 35; }
    else if (parsedRate < 50) { actMin = 28; actMax = 32; }
    else { actMin = 18; actMax = 24; }
  }
  const dynActLeft = Math.max(0, Math.min(90, ((actMin - 1) / 35) * 100));
  const dynActWidth = Math.max(10, Math.min(100 - dynActLeft, ((actMax - actMin) / 35) * 100));

  return (
    <div ref={containerRef} className="flex flex-col gap-16 py-4 max-w-4xl">

      {/* Source citation
      <p className="text-[11px] italic font-light text-slate-400 font-poppins">
        Source: Information is based on publicly available data from official U.S. Department of
        Education sources, including IPEDS, College Scorecard, and College Navigator.
      </p> */}

      {/* ── 1. Acceptance Rate ── */}
      <div className="flex flex-col gap-8">
        <h2
          className="text-2xl font-semibold font-poppins"
          style={{ color: '#F7221F' }}
        >
          Acceptance Rate
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-10">

          {/* SVG Ring Chart */}
          <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Gray background ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="white"
                stroke="#CBD5E1"
                strokeWidth={strokeWidth}
              />
              {/* Blue progress arc */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#2054FE"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            {/* Rate text centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-black font-lexend text-slate-900"
                style={{ fontSize: 36 }}
              >
                {parsedRate > 0 ? `${(parsedRate * animProgress).toFixed(1)}%` : admissionRate}
              </span >
            </div >
          </div >

          {/* Badge + description */}
          < div className="flex flex-col items-start gap-4" >
            <div
              className="px-5 py-2 rounded-full inline-flex"
              style={{ background: '#2054FE' }}
            >
              <span className="text-sm font-bold text-white uppercase tracking-wider font-poppins">
                {competitiveness}
              </span>
            </div>
            <p className="text-base text-slate-500 font-poppins leading-relaxed max-w-xl">
              {description}
            </p>
          </div >

        </div >
      </div >

      {/* ── 2. Standardized Test Scores ── */}
      < div className="flex flex-col gap-10" >
        <h2
          className="text-2xl font-semibold font-poppins"
          style={{ color: '#F7221F' }}
        >
          Standardized Test Scores (25th–75th Percentile)
        </h2>

        <div className="flex flex-col gap-10 max-w-3xl">

          {/* SAT Score Range */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-slate-600 font-poppins">
                SAT Score Range
              </span>
              {hasSatData ? (
                <span className="text-base font-bold text-slate-900 font-poppins">
                  {400 + Math.round((satMin - 400) * animProgress)} — {400 + Math.round((satMax - 400) * animProgress)}
                </span>
              ) : (
                <p className="text-sm text-slate-400 font-poppins italic">SAT data not available for this university.</p>
              )}
            </div>
            <div
              className="relative w-full overflow-hidden"
              style={{ height: 14, background: '#F1F5F9', borderRadius: 9999 }}
            >
              <div
                className="absolute h-full"
                style={{
                  left: `${dynSatLeft}%`,
                  width: `${dynSatWidth * animProgress}%`,
                  background: 'linear-gradient(90deg, #60A5FA 0%, #2563EB 100%)',
                  borderRadius: 9999,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-poppins">
              <span>400</span>
              <span>1600</span>
            </div>
          </div>

          {/* ACT Composite Range */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-slate-600 font-poppins">
                ACT Composite Range
              </span>
              <span className="text-base font-bold text-slate-900 font-poppins">
                {1 + Math.round((actMin - 1) * animProgress)} — {1 + Math.round((actMax - 1) * animProgress)}
              </span>
            </div>
            <div
              className="relative w-full overflow-hidden"
              style={{ height: 14, background: '#F1F5F9', borderRadius: 9999 }}
            >
              <div
                className="absolute h-full"
                style={{
                  left: `${dynActLeft}%`,
                  width: `${dynActWidth * animProgress}%`,
                  background: 'linear-gradient(90deg, #60A5FA 0%, #2563EB 100%)',
                  borderRadius: 9999,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-poppins">
              <span>1</span>
              <span>36</span>
            </div>
          </div>

          {/* Estimated range note */}
          <p
            className="text-sm italic font-light font-poppins"
            style={{ color: '#D03436' }}
          >
            This is an estimated range based on your score
          </p>

        </div>
      </div >

    </div >
  );
}