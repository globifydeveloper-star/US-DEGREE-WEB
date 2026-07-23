"use client";

import React, { useEffect, useRef, useState } from "react";
import { AdmissionsOverviewProps } from "@/types/university/AdmissionsOverview";
import DisclaimerTooltip from "@/components/common/DisclaimerTooltip";
import EarningsMethodBadge from "@/components/common/EarningsMethodBadge";
import { DATA_SOURCE_DISCLAIMERS } from "@/constants/dataSourceDisclaimers";

const parseDisplayNumber = (value: string) =>
  Number(value.replace(/[^0-9.]/g, ""));

const formatDisplayNumber = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatCurrency = (
  value: number | string | null | undefined,
  compact = false,
): string => {
  if (value === null || value === undefined) return "N/A";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  const parts = Math.round(n).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "$" + parts[0];
};

const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const pct = n < 2 ? n * 100 : n;
  return `${pct.toFixed(1).replace(/\.0$/, "")}%`;
};

export default function AdmissionsOverview({
  admissionRate,
  applicants,
  satReadingWriting,
  satMath,
  satAverage,
  salaryYear1,
  salaryYear10,
  salaryYear1Method,
  salaryYear10Method,
  netRoi20Yr,
  growthRate,
}: AdmissionsOverviewProps) {
  const admissionRateValue = parseFloat(admissionRate);
  const parsedRate = isNaN(admissionRateValue) ? 0 : admissionRateValue;
  const acceptedApplicants = parseDisplayNumber(applicants);
  const estimatedTotal =
    parsedRate > 0 ? acceptedApplicants / (parsedRate / 100) : 0;

  const percentage = Math.min(Math.max(parsedRate, 0), 100);
  const strokeWidth = 14;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const effectiveSalaryYear1 = salaryYear1;
  const effectiveSalaryYear10 = salaryYear10;
  const effectiveNetRoi = netRoi20Yr;
  const effectiveGrowthRate = growthRate;

  const competitiveness =
    parsedRate > 0
      ? parsedRate < 10
        ? "Highly Competitive"
        : parsedRate < 30
          ? "Selective"
          : parsedRate < 70
            ? "Moderately Selective"
            : "Open Admission"
      : "Admission Rate";

  // ── Animation state ──
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate the stroke offset via CSS transition (handled inline)
          setAnimatedOffset(circumference - (percentage / 100) * circumference);

          // Count-up the percentage number
          const duration = 1200; // ms
          const steps = 60;
          const stepTime = duration / steps;
          let current = 0;
          const increment = percentage / steps;
          const timer = setInterval(() => {
            current += increment;
            if (current >= percentage) {
              current = percentage;
              clearInterval(timer);
            }
            setAnimatedPercent(parseFloat(current.toFixed(1)));
          }, stepTime);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, percentage, circumference]);

  // ── Compute SAT bar widths from score strings ──
  const parseSatBarPercent = (rangeStr: string, maxScore: number): number => {
    if (!rangeStr || rangeStr === "N/A") return 75; // sensible fallback
    const nums = rangeStr.match(/\d+/g);
    if (!nums || nums.length === 0) return 75;
    if (nums.length >= 2) {
      // Range like "690 - 840" → use midpoint
      const mid = (parseInt(nums[0]) + parseInt(nums[1])) / 2;
      return Math.min(Math.round((mid / maxScore) * 100), 100);
    }
    // Single value like "1203"
    return Math.min(Math.round((parseInt(nums[0]) / maxScore) * 100), 100);
  };

  const satRwBarPct = parseSatBarPercent(satReadingWriting, 800);
  const satMathBarPct = parseSatBarPercent(satMath, 800);
  const satAvgBarPct = parseSatBarPercent(satAverage, 1600);

  // ── Outcomes card count-up animation ──
  const outcomesRef = useRef<HTMLDivElement>(null);
  const [outcomesAnimated, setOutcomesAnimated] = useState(false);
  const [animSalary10, setAnimSalary10] = useState("$0");
  const [animSalary1, setAnimSalary1] = useState("$0");
  const [animRoi, setAnimRoi] = useState("$0");
  const [animGrowth, setAnimGrowth] = useState("0%");

  useEffect(() => {
    const el = outcomesRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !outcomesAnimated) {
          setOutcomesAnimated(true);

          const sal10Target = Number(effectiveSalaryYear10) || 0;
          const sal1Target = Number(effectiveSalaryYear1) || 0;
          const roiTarget = Number(effectiveNetRoi) || 0;
          const growthTarget = Number(effectiveGrowthRate) || 0;

          const duration = 1200;
          const steps = 60;
          const stepTime = duration / steps;
          let step = 0;

          const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            if (sal10Target > 0)
              setAnimSalary10(formatCurrency(eased * sal10Target));
            if (sal1Target > 0)
              setAnimSalary1(formatCurrency(eased * sal1Target));
            if (roiTarget > 0)
              setAnimRoi(formatCurrency(eased * roiTarget, true));
            if (growthTarget > 0)
              setAnimGrowth(formatPercent(eased * growthTarget));

            if (step >= steps) {
              clearInterval(timer);
              setAnimSalary10(formatCurrency(effectiveSalaryYear10));
              setAnimSalary1(formatCurrency(effectiveSalaryYear1));
              setAnimRoi(formatCurrency(effectiveNetRoi, true));
              setAnimGrowth(formatPercent(effectiveGrowthRate));
            }
          }, stepTime);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    outcomesAnimated,
    effectiveSalaryYear10,
    effectiveSalaryYear1,
    effectiveNetRoi,
    effectiveGrowthRate,
  ]);

  return (
    <div className="mb-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-lexend  border-slate-900 pb-1 leading-none">
          Admissions Overview
        </h2>
      </div>

      {/* Acceptance Rate + SAT Bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left — Animated circular progress card */}
        <div
          ref={cardRef}
          className="flex flex-col items-center justify-center gap-5 py-10 px-8"
          style={{ background: "#F8FAFC", borderRadius: 20 }}
        >
          <div
            style={{ width: 170, height: 170 }}
            className="relative flex items-center justify-center"
          >
            <svg
              width="170"
              height="170"
              viewBox="0 0 170 170"
              className="w-full h-full"
            >
              {/* Gray background track with white inner fill */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="white"
                stroke="#CBD5E1"
                strokeWidth={strokeWidth}
              />
              {/* Blue active progress segment — animated via CSS transition */}
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                stroke="#2054FE"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={animatedOffset}
                strokeLinecap="round"
                transform="rotate(-90 85 85)"
                style={{
                  transition:
                    "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black font-lexend text-slate-900  border-slate-900 pb-0.5 leading-none">
                {hasAnimated
                  ? animatedPercent >= percentage
                    ? admissionRate
                    : `${animatedPercent.toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </div>
          <p className="text-base font-bold font-lexend text-slate-900 border-slate-900 pb-0.5 inline-block">
            {competitiveness}
          </p>
        </div>

        {/* Right — Animated SAT bars */}
        <div className="flex flex-col gap-6 justify-center">
          {/* SAT Reading & Writing */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 font-lexend">
                SAT Evidence-Based Reading & Writing
              </span>
              <span className="text-sm font-bold text-slate-900 font-lexend">
                {satReadingWriting}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2054FE]"
                style={{
                  width: hasAnimated ? `${satRwBarPct}%` : "0%",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
                }}
              />
            </div>
          </div>

          {/* SAT Math */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 font-lexend">
                SAT Math
              </span>
              <span className="text-sm font-bold text-slate-900 font-lexend">
                {satMath}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2054FE]"
                style={{
                  width: hasAnimated ? `${satMathBarPct}%` : "0%",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s",
                }}
              />
            </div>
          </div>

          {/* SAT Average */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-900 font-lexend">
              SAT Average (Overall)
            </span>
            <span className="text-sm font-bold text-slate-900 font-lexend">
              {satAverage}
            </span>
            <div className="h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2054FE]"
                style={{
                  width: hasAnimated ? `${satAvgBarPct}%` : "0%",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.7s",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {parsedRate > 0 && acceptedApplicants > 0 && (
        <p className="text-sm font-semibold text-slate-700">
          Estimated {formatDisplayNumber(estimatedTotal)} applicants, with{" "}
          {formatDisplayNumber(acceptedApplicants)} accepted.
        </p>
      )}

      {/* Outcomes card — animated count-up */}
      <div
        ref={outcomesRef}
        className="bg-white w-full p-6"
        style={{
          borderRadius: 20,
          boxShadow: "0px 2px 3px rgba(0,0,0,0.05)",
          outline: "3px #F1F5F9 solid",
          outlineOffset: "-3px",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Salary 10th Year */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{
              borderRadius: 10,
              outline: "1.25px #E2E8F0 solid",
              minHeight: 120,
            }}
          >
            <p
              className="text-3xl font-black leading-none font-lexend"
              style={{ color: "#0AC69D" }}
            >
              {outcomesAnimated ? animSalary10 : "$0"}+
            </p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-lexend mt-3">
              Median Salary in 10
              <span className="align-super text-[7px]">th</span> Year
              <DisclaimerTooltip text={DATA_SOURCE_DISCLAIMERS.ipeds} />
              {salaryYear10Method && (
                <EarningsMethodBadge method={salaryYear10Method} />
              )}
            </p>
          </div>

          {/* Salary 1st Year */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{
              borderRadius: 10,
              outline: "1.25px #E2E8F0 solid",
              minHeight: 120,
            }}
          >
            <p
              className="text-3xl font-black leading-none font-lexend"
              style={{ color: "#45A0D0" }}
            >
              {outcomesAnimated ? animSalary1 : "$0"}
            </p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Median Salary in 1
              <span className="align-super text-[7px]">st</span> Year
              <DisclaimerTooltip text={DATA_SOURCE_DISCLAIMERS.ipeds} />
              {salaryYear1Method && (
                <EarningsMethodBadge method={salaryYear1Method} />
              )}
            </p>
          </div>

          {/* 20-Year Net ROI */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{
              borderRadius: 10,
              outline: "1.25px #E2E8F0 solid",
              minHeight: 130,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-poppins mb-2">
              20-Year Net ROI
            </p>
            <p
              className="text-3xl font-black leading-none font-poppins"
              style={{ color: "#AB61FF" }}
            >
              {outcomesAnimated ? animRoi : "$0"}
            </p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Lifetime Earnings Premium
              <DisclaimerTooltip
                text={DATA_SOURCE_DISCLAIMERS.lehdCalculated}
              />
            </p>
          </div>

          {/* Growth Rate */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{
              borderRadius: 10,
              outline: "1.25px #E2E8F0 solid",
              minHeight: 130,
            }}
          >
            <p
              className="text-3xl font-black leading-none font-poppins"
              style={{ color: "#F75659" }}
            >
              {outcomesAnimated ? animGrowth : "0%"}
            </p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Growth Rate
              <DisclaimerTooltip
                text={DATA_SOURCE_DISCLAIMERS.lehdCalculated}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
