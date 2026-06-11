"use client";

import React, { useEffect, useRef, useState } from 'react';
import { CampusStudentsTabProps } from '@/types/university/CampusStudentsTab';

export default function CampusStudentsTab({ campusData, fafsaApplications }: CampusStudentsTabProps) {

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

  // Extract values, return null if missing
  const sizeCategory = campusData?.campus?.size_category || "N/A";
  const sizeCategorySub = sizeCategory === "N/A" ? "N/A" : (sizeCategory.toLowerCase().includes("large") ? "Large (15,000+)" : sizeCategory);

  const size = campusData?.campus?.size !== null && campusData?.campus?.size !== undefined
    ? Number(campusData.campus.size)
    : null;

  const gradStudents = campusData?.students?.grad_students !== null && campusData?.students?.grad_students !== undefined
    ? Number(campusData.students.grad_students)
    : null;

  // Student Demographics (Men / Women)
  const menStudentsPct = campusData?.students?.demographics?.men !== null && campusData?.students?.demographics?.men !== undefined
    ? (() => { const n = Number(campusData.students.demographics.men); return n < 2 ? n * 100 : n; })()
    : null;
  const womenStudentsPct = campusData?.students?.demographics?.women !== null && campusData?.students?.demographics?.women !== undefined
    ? (() => { const n = Number(campusData.students.demographics.women); return n < 2 ? n * 100 : n; })()
    : null;

  // Student-Faculty Ratio
  const rawFacultyRatio = campusData?.campus?.student_faculty_ratio;
  const facultyRatioNum = rawFacultyRatio
    ? parseFloat(rawFacultyRatio.split(":")[0])
    : null;

  // Faculty Demographics
  const menFacultyPct = campusData?.students?.faculty?.men !== null && campusData?.students?.faculty?.men !== undefined
    ? (() => { const n = Number(campusData.students.faculty.men); return n < 2 ? n * 100 : n; })()
    : null;
  const womenFacultyPct = campusData?.students?.faculty?.women !== null && campusData?.students?.faculty?.women !== undefined
    ? (() => { const n = Number(campusData.students.faculty.women); return n < 2 ? n * 100 : n; })()
    : null;

  // Repayment 3-Year Progress Rates
  const toPercentVal = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return num < 2 ? num * 100 : num;
  };

  const allBorrowersPct = toPercentVal(campusData?.repayment?.all_borrowers_3yr);
  const graduatesPct = toPercentVal(campusData?.repayment?.graduates_3yr);
  const nonCompletersPct = toPercentVal(campusData?.repayment?.non_completers_3yr);

  // Year 1 to Year 3 change table data
  const yr1 = campusData?.repayment?.yr1_overall !== null && campusData?.repayment?.yr1_overall !== undefined
    ? Number(campusData.repayment.yr1_overall)
    : null;
  const yr3 = campusData?.repayment?.yr3_overall !== null && campusData?.repayment?.yr3_overall !== undefined
    ? Number(campusData.repayment.yr3_overall)
    : null;
  const netChange = yr3 !== null && yr1 !== null ? yr3 - yr1 : null;

  // Completers vs Non-Completers table data
  const yr3Completers = campusData?.repayment?.yr3_completers !== null && campusData?.repayment?.yr3_completers !== undefined
    ? Number(campusData.repayment.yr3_completers)
    : null;
  const yr3NonCompleters = campusData?.repayment?.yr3_noncompleters !== null && campusData?.repayment?.yr3_noncompleters !== undefined
    ? Number(campusData.repayment.yr3_noncompleters)
    : null;
  const graduatesAdvantage = yr3Completers !== null && yr3NonCompleters !== null ? yr3Completers - yr3NonCompleters : null;

  // Income details
  const avgFamilyIncome = campusData?.campus?.avg_family_income !== null && campusData?.campus?.avg_family_income !== undefined
    ? Number(campusData.campus.avg_family_income) : null;
  const choiceAidPct = campusData?.students?.choice_aid !== null && campusData?.students?.choice_aid !== undefined
    ? Number(campusData.students.choice_aid) : null;

  // Format dynamic FAFSA count
  const fafsaCount = fafsaApplications !== null && fafsaApplications !== undefined
    ? fafsaApplications
    : "N/A";

  return (
    <div ref={containerRef} className="flex flex-col gap-10 py-4 w-full">

      {/* 1. Enrolment & Size */}
      <div>
        <h2 className="text-[26px] font-black text-[#1E293B] mb-6 tracking-tight leading-none">
          Enrolment & Size
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Size Category */}
          <div className="bg-[#EBF3FF]/60 border border-[#DBEAFE]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{sizeCategory}</p>
              {/* <p className="text-[11px] font-bold text-[#2563EB] mb-0">{sizeCategorySub}</p> */}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Size Category</p>
          </div>

          {/* Total Students */}
          <div className="bg-[#E6F4EA]/60 border border-[#DCFCE7]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{size !== null ? size.toLocaleString() : "Not Available"}</p>
              <p className="text-[11px] font-bold text-emerald-600 mb-0">Total Students</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Total Students</p>
          </div>

          {/* Grad Students */}
          <div className="bg-[#EBF3FF]/60 border border-[#FEF9C3]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{gradStudents !== null ? gradStudents.toLocaleString() : "Not Available"}</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Grad Students</p>
          </div>

          {/* Student-to-Faculty Ratio */}
          <div className="bg-rose-50/20 border border-rose-100/60 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {facultyRatioNum !== null ? `${facultyRatioNum}:1` : "N/A"}
              </p>
              <div className="h-2 bg-[#EAEFF5] rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: facultyRatioNum !== null ? `${Math.min((facultyRatioNum / 35) * 100, 100) * animProgress}%` : "0%" }}
                />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Faculty Ratio</p>
          </div>
        </div>
      </div>

      {/* 2. Gender Distribution */}
      <div>
        <h2 className="text-[26px] font-black text-[#1E293B] mb-6 tracking-tight leading-none">
          Gender Distribution
        </h2>

        <div className="bg-white border border-[#EAEFF5] rounded-[32px] p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">

            {/* Student Men */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Men (Students)</span>
                <span>{menStudentsPct !== null ? `${(menStudentsPct * animProgress).toFixed(1)}%` : "N/A"}</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A5A] rounded-full" style={{ width: menStudentsPct !== null ? `${menStudentsPct * animProgress}%` : "0%" }} />
              </div>
            </div>

            {/* Faculty Men */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Men (Faculty)</span>
                <span>{menFacultyPct !== null ? `${(menFacultyPct * animProgress).toFixed(1)}%` : "N/A"}</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A5A] rounded-full" style={{ width: menFacultyPct !== null ? `${menFacultyPct * animProgress}%` : "0%" }} />
              </div>
            </div>

            {/* Student Women */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Women (Students)</span>
                <span>{womenStudentsPct !== null ? `${(womenStudentsPct * animProgress).toFixed(1)}%` : "N/A"}</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#EC4899] rounded-full" style={{ width: womenStudentsPct !== null ? `${womenStudentsPct * animProgress}%` : "0%" }} />
              </div>
            </div>

            {/* Faculty Women */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Women (Faculty)</span>
                <span>{womenFacultyPct !== null ? `${(womenFacultyPct * animProgress).toFixed(1)}%` : "N/A"}</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#EC4899] rounded-full" style={{ width: womenFacultyPct !== null ? `${womenFacultyPct * animProgress}%` : "0%" }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Repayment Progress By Group */}
      <div>
        <div className="bg-white border border-[#EAEFF5] rounded-[32px] p-8 shadow-sm flex flex-col gap-6">
          <h3 className="text-[20px] font-black text-slate-900 tracking-tight leading-none">
            Repayment Progress By Group
          </h3>

          <div className="flex flex-col gap-6">
            {/* All Borrowers */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>All Borrowers - 3year Progress</span>
                <span>{allBorrowersPct !== null ? `${Math.round(allBorrowersPct * animProgress)}%` : "N/A"}</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: allBorrowersPct !== null ? `${allBorrowersPct * animProgress}%` : "0%" }} />
              </div>
            </div>

            {/* Graduates */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>Graduates</span>
                <span>{graduatesPct !== null ? `${Math.round(graduatesPct * animProgress)}%` : "N/A"}</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: graduatesPct !== null ? `${graduatesPct * animProgress}%` : "0%" }} />
              </div>
            </div>

            {/* Non-Completers */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>Non - Completers</span>
                <span>{nonCompletersPct !== null ? `${Math.round(nonCompletersPct * animProgress)}%` : "N/A"}</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: nonCompletersPct !== null ? `${nonCompletersPct * animProgress}%` : "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Year 1 - Year 3 Change & Completers vs Non-Completers Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Year 1 - Year 3 Change */}
        <div className="bg-white border border-[#EAEFF5] rounded-[32px] p-8 shadow-sm flex flex-col gap-5">
          <h4 className="text-[16px] font-black text-slate-900 tracking-tight leading-none">
            Year 1 - Year 3 Change
          </h4>
          <div className="flex flex-col">
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Loan Borrowers year 1</span>
              <span className="text-slate-900 font-extrabold">{yr1 !== null ? yr1.toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Still Repaying Year 3</span>
              <span className="text-slate-900 font-extrabold">{yr3 !== null ? yr3.toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between pt-3 text-xs font-black text-slate-900">
              <span>Net Change</span>
              <span className={netChange !== null && netChange < 0 ? "text-[#FF5A5A]" : (netChange !== null ? "text-[#10B981]" : "text-slate-400")}>
                {netChange !== null ? (netChange > 0 ? `+${netChange.toLocaleString()}` : netChange.toLocaleString()) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Completers vs Non-Completers */}
        <div className="bg-white border border-[#EAEFF5] rounded-[32px] p-8 shadow-sm flex flex-col gap-5">
          <h4 className="text-[16px] font-black text-slate-900 tracking-tight leading-none">
            Completers vs Non-Completers
          </h4>
          <div className="flex flex-col">
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Graduates Repaying</span>
              <span className="text-slate-900 font-extrabold">{yr3Completers !== null ? yr3Completers.toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Non-Completers Repaying</span>
              <span className="text-slate-900 font-extrabold">{yr3NonCompleters !== null ? yr3NonCompleters.toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between pt-3 text-xs font-black text-slate-900">
              <span>Graduates Advantage</span>
              <span className="text-[#3B82F6]">
                {graduatesAdvantage !== null ? `+${graduatesAdvantage.toLocaleString()}` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Income Details */}
      <div>
        <h2 className="text-[26px] font-black text-[#1E293B] mb-6 tracking-tight leading-none">
          Income Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Average Family Income */}
          <div className="bg-[#FEFCE8]/60 border border-[#FEF9C3]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {avgFamilyIncome !== null ? `$${Math.round(avgFamilyIncome * animProgress).toLocaleString()}` : "N/A"}
              </p>
              <p className="text-[11px] font-bold text-[#F59E0B] mb-0">Avg family income</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Avg family income</p>
          </div>

          {/* Students with Choice-Aid */}
          <div className="bg-[#E6F4EA]/60 border border-[#DCFCE7]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {choiceAidPct !== null ? `${(choiceAidPct * animProgress).toFixed(1)}%` : "N/A"}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 mb-0">Students with choice-aid</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Students with choice-aid</p>
          </div>

          {/* FAFSA Applications */}
          <div className="bg-[#FFF1F2]/60 border border-[#FFE4E6]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {fafsaCount === "N/A" ? "N/A" : Math.round(Number(fafsaCount) * animProgress).toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-rose-600 mb-0">FAFSA applications</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">FAFSA applications</p>
          </div>
        </div>
      </div>

    </div>
  );
}
