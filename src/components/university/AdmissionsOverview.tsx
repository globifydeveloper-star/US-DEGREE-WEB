"use client";

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
  const parts = Math.round(n).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts[0];
};

const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  const pct = n < 2 ? n * 100 : n;
  return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
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
  growthRate,
}: AdmissionsOverviewProps) {
  const admissionRateValue = parseFloat(admissionRate);
  const parsedRate = isNaN(admissionRateValue) ? 0 : admissionRateValue;
  const acceptedApplicants = parseDisplayNumber(applicants);
  const estimatedTotal = parsedRate > 0 ? acceptedApplicants / (parsedRate / 100) : 0;

  const percentage = Math.min(Math.max(parsedRate, 0), 100);
  const strokeWidth = 14;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const effectiveSalaryYear1 = salaryYear1;
  const effectiveSalaryYear10 = salaryYear10;
  const effectiveNetRoi = netRoi20Yr;
  const effectiveGrowthRate = growthRate;

  const competitiveness =
    parsedRate > 0
      ? parsedRate < 10
        ? 'Highly Competitive'
        : parsedRate < 30
          ? 'Selective'
          : parsedRate < 70
            ? 'Moderately Selective'
            : 'Open Admission'
      : 'Admission Rate';

  return (
    <div className="mb-10 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-lexend inline-block border-b-[3px] border-slate-900 pb-1 leading-none">
          Admissions Overview
        </h2>
        <p className="text-[10px] italic text-slate-400">
          Source: An official website of the United States government
        </p>
      </div>

      {/* Acceptance Rate + SAT Bars */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

        {/* Left — Circular progress loader card */}
        <div
          className="flex flex-col items-center justify-center gap-5 py-10 px-8"
          style={{ background: '#F8FAFC', borderRadius: 20 }}
        >
          <div
            style={{ width: 170, height: 170 }}
            className="relative flex items-center justify-center"
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
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black font-lexend text-slate-900 border-b-[3px] border-slate-900 pb-0.5 leading-none">
                {admissionRate}
              </span>
            </div>
          </div>
          <p className="text-base font-bold font-lexend text-slate-900 border-b-[2px] border-slate-900 pb-0.5 inline-block">
            {competitiveness}
          </p>
        </div>

        {/* Right — SAT bars */}
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
              <div className="h-full rounded-full bg-[#2054FE] w-[90%]" />
            </div>
          </div>

          {/* SAT Math */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 font-lexend">SAT Math</span>
              <span className="text-sm font-bold text-slate-900 font-lexend">{satMath}</span>
            </div>
            <div className="h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div className="h-full rounded-full bg-[#2054FE] w-[95%]" />
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
              <div className="h-full rounded-full bg-[#2054FE] w-[95%]" />
            </div>
          </div>

        </div>
      </div>

      {parsedRate > 0 && acceptedApplicants > 0 && (
        <p className="text-sm font-semibold text-slate-700">
          Estimated {formatDisplayNumber(estimatedTotal)} applicants, with{' '}
          {formatDisplayNumber(acceptedApplicants)} accepted.
        </p>
      )}

      {/* Outcomes card */}
      <div
        className="bg-white w-full p-6"
        style={{
          borderRadius: 20,
          boxShadow: '0px 2px 3px rgba(0,0,0,0.05)',
          outline: '3px #F1F5F9 solid',
          outlineOffset: '-3px',
        }}
      >
        <div className="grid grid-cols-2 gap-4">

          {/* Salary 10th Year */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 120 }}
          >
            <p className="text-3xl font-black leading-none font-lexend" style={{ color: '#0AC69D' }}>
              {formatCurrency(effectiveSalaryYear10)}+
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-lexend mt-3">
              Median Salary in 10<span className="align-super text-[7px]">th</span> Year
            </p>
          </div>

          {/* Salary 1st Year */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 120 }}
          >
            <p className="text-3xl font-black leading-none font-lexend" style={{ color: '#45A0D0' }}>
              {formatCurrency(effectiveSalaryYear1)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Median Salary in 1<span className="align-super text-[7px]">st</span> Year
            </p>
          </div>

          {/* 20-Year Net ROI */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 130 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-poppins mb-2">
              20-Year Net ROI
            </p>
            <p className="text-3xl font-black leading-none font-poppins" style={{ color: '#AB61FF' }}>
              {formatCurrency(effectiveNetRoi, true)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Lifetime Earnings Premium
            </p>
          </div>

          {/* Growth Rate */}
          <div
            className="bg-white flex flex-col justify-between p-5"
            style={{ borderRadius: 10, outline: '1.25px #E2E8F0 solid', minHeight: 130 }}
          >
            <p className="text-3xl font-black leading-none font-poppins" style={{ color: '#F75659' }}>
              {formatPercent(effectiveGrowthRate)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-poppins mt-3">
              Growth Rate
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}