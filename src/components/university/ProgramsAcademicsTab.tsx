import React, { useState } from 'react';

interface ProgramsAcademicsTabProps {
  data: any;
}

export default function ProgramsAcademicsTab({ data }: ProgramsAcademicsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('all');
  if (!data) return null;

  const name = data.name || "N/A";
  const admissionRate = data.admissionRate || "N/A";
  const totalStudents = data.totalStudents;
  const completionRate = data.completionRate || "N/A";
  const facultyRatio = data.facultyRatio || "N/A";

  const toPercentVal = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return num < 2 ? Math.round(num * 100) : Math.round(num);
  };

  const rawRepayment = data.campusData?.repayment?.all_borrowers_3yr;
  const loanRepaymentVal = toPercentVal(rawRepayment);
  const loanRepaymentDisplay = loanRepaymentVal !== null ? `${loanRepaymentVal}%` : "N/A";

  // Dynamic selective label
  const parsedRate = parseFloat(admissionRate);
  const selectiveLabel = !isNaN(parsedRate) && parsedRate > 0
    ? (parsedRate < 10 ? "Highly Selective" : parsedRate < 30 ? "Selective" : "Competitive")
    : "N/A";

  // Dynamic tuition parser
  let tuitionDisplay = "N/A";
  if (data.tuitionFee && data.tuitionFee !== "N/A") {
    tuitionDisplay = data.tuitionFee;
  } else if (data.tuitionData?.tuition?.tuition_in_state) {
    const parsed = parseFloat(String(data.tuitionData.tuition.tuition_in_state).replace(/[^0-9.]/g, ''));
    tuitionDisplay = isNaN(parsed) ? String(data.tuitionData.tuition.tuition_in_state) : `$${Math.round(parsed).toLocaleString()}`;
  }



  return (
    <div className="flex flex-col gap-12 py-6 w-full">

      {/* 1. Top Row of 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Acceptance Rate */}
        <div className="bg-[#EEF2FF] border border-[#E0E7FF]/80 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
          <p className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider mb-1">Acceptance Rate</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight mb-0.5">{admissionRate}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{selectiveLabel}</p>
        </div>

        {/* Tuition (EST.) */}
        <div className="bg-[#FEFCE8] border border-[#FEF9C3]/80 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
          <p className="text-[10px] font-black text-[#CA8A04] uppercase tracking-wider mb-1">Tuition (EST.)</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight mb-0.5">{tuitionDisplay}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Per Academic Year</p>
        </div>

        {/* Total Enrollment */}
        <div className="bg-[#FFF1F2] border border-[#FFE4E6]/80 rounded-3xl p-6.5 flex flex-col justify-center min-h-[108px] shadow-sm">
          <p className="text-[10px] font-black text-[#E11D48] uppercase tracking-wider mb-1">Total Enrollment</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight mb-0.5">
            {totalStudents != null ? totalStudents.toLocaleString() : "N/A"}
          </p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Undergrad & Grad</p>
        </div>
      </div>

      {/* 2. Academic Excellence Section */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 inline-block">
          Academic Excellence
        </h2>
        <p className="text-xs text-gray-500 mb-6 font-medium">
          World-class mentorship and institutional outcomes that define leadership in higher education.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Graduation Rate */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7]/60 rounded-3xl p-6.5 flex flex-col gap-3 shadow-sm">
            <div className="w-10 h-10 bg-white border border-[#DCFCE7] rounded-full flex items-center justify-center text-[#15803D]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-[#15803D] tracking-tight mb-0.5">{completionRate}</p>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Graduation Rate</p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Consistency in student success through comprehensive support systems and peer networks.
              </p>
            </div>
          </div>

          {/* Card 2: Faculty-Student Ratio */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE]/60 rounded-3xl p-6.5 flex flex-col gap-3 shadow-sm">
            <div className="w-10 h-10 bg-white border border-[#DBEAFE] rounded-full flex items-center justify-center text-[#1D4ED8]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-[#1D4ED8] tracking-tight mb-0.5">{facultyRatio}</p>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Faculty-Student Ratio</p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Unparalleled access to Nobel laureates and industry pioneers in intimate learning environments.
              </p>
            </div>
          </div>

          {/* Card 3: Loan Repayment Success */}
          <div className="bg-[#FFF1F2] border border-[#FFE4E6]/60 rounded-3xl p-6.5 flex flex-col gap-3 shadow-sm relative">
            <div className="w-10 h-10 bg-white border border-[#FFE4E6] rounded-full flex items-center justify-center text-[#E11D48]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-[#E11D48] tracking-tight mb-0.5">{loanRepaymentDisplay}</p>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Loan Repayment Success (3-Year)</p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Graduates actively repaying student loans within three years.
              </p>
            </div>
            {/* Red dot indicator matching Figma */}
            {/* <div className="absolute right-5 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
              <span className="ate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </div> */}
          </div>
        </div>
      </div>

      {/* 3. Popular Fields of Study */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 inline-block">
          Popular Fields of Study
        </h2>
        <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed max-w-3xl">
          {name} students pursue diverse interests, with a strong focus on interdisciplinary programs that bridge technology, human systems, and global economics.
        </p>

        {/* Progress bar lists */}
        <div className="flex flex-col gap-4.5 bg-white border border-gray-150 rounded-3xl p-8 shadow-sm">
          {/* CS */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-900">
              <span>Computer Science</span>
              <span>16%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: '16%' }} />
            </div>
          </div>

          {/* Biology */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-900">
              <span>Biology / Biological Sciences</span>
              <span>12%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#EC4899] rounded-full transition-all duration-1000" style={{ width: '12%' }} />
            </div>
          </div>

          {/* Economics */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-900">
              <span>Economics</span>
              <span>11%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#EF4444] rounded-full transition-all duration-1000" style={{ width: '11%' }} />
            </div>
          </div>

          {/* MSE */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-900">
              <span>Management Science & Engineering</span>
              <span>9%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#06B6D4] rounded-full transition-all duration-1000" style={{ width: '9%' }} />
            </div>
          </div>

          {/* Symbolic Systems */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-900">
              <span>Symbolic Systems</span>
              <span>7%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#F97316] rounded-full transition-all duration-1000" style={{ width: '7%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Comprehensive Degree Levels */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 inline-block">
          Comprehensive Degree Levels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Undergraduate */}
          <div className="bg-[#FEFCE8]/40 border border-[#E7E2C4]/50 rounded-[28px] p-7 flex flex-col items-start text-left shadow-sm min-h-[280px]">
            <div className="w-14 h-14 bg-[#2563EB] text-white rounded-full flex items-center justify-center mb-5.5 shadow-md">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <p className="text-base font-extrabold text-gray-900 mb-2">Undergraduate</p>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium min-h-[48px]">
              Bachelor of Arts (A.B.), Bachelor of Science (B.S.), and Bachelor of Arts and Sciences (B.A.S.) programs.
            </p>
            <ul className="flex flex-col gap-1.5 mt-auto w-full text-[11px] font-bold text-[#1D4ED8] list-none">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                95+ Major Fields
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                First-Year Seminars
              </li>
            </ul>
          </div>

          {/* Graduate */}
          <div className="bg-[#F0FDF4]/40 border border-[#C8E7D5]/50 rounded-[28px] p-7 flex flex-col items-start text-left shadow-sm min-h-[280px]">
            <div className="w-14 h-14 bg-[#2563EB] text-white rounded-full flex items-center justify-center mb-5.5 shadow-md">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-base font-extrabold text-gray-900 mb-2">Graduate</p>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium min-h-[48px]">
              Advanced research degrees across all seven schools, including Master's and Ph.D. pathways.
            </p>
            <ul className="flex flex-col gap-1.5 mt-auto w-full text-[11px] font-bold text-[#1D4ED8] list-none">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                230+ Graduate Programs
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                Interdisciplinary Research
              </li>
            </ul>
          </div>

          {/* Professional */}
          <div className="bg-[#FFF1F2]/40 border border-[#F7D2D6]/50 rounded-[28px] p-7 flex flex-col items-start text-left shadow-sm min-h-[280px]">
            <div className="w-14 h-14 bg-[#2563EB] text-white rounded-full flex items-center justify-center mb-5.5 shadow-md">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-extrabold text-gray-900 mb-2">Professional</p>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-medium min-h-[48px]">
              Executive education, law, medicine, and business leadership training for global experts.
            </p>
            <ul className="flex flex-col gap-1.5 mt-auto w-full text-[11px] font-bold text-[#1D4ED8] list-none">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                GSB & Law School
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                Medical Residency
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

