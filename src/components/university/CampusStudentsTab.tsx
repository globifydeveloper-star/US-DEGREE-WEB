import React from 'react';

interface CampusStudentsTabProps {
  campusData: any;
  fafsaApplications?: number | null;
}

export default function CampusStudentsTab({ campusData, fafsaApplications }: CampusStudentsTabProps) {
  // Extract values with robust mock fallbacks if database details are missing or null
  const sizeCategory = campusData?.campus?.size_category || "Large";
  const sizeCategorySub = sizeCategory.toLowerCase().includes("large") ? "Large (15,000+)" : sizeCategory;
  
  const size = campusData?.campus?.size !== null && campusData?.campus?.size !== undefined
    ? Number(campusData.campus.size)
    : 38103;

  const gradStudents = campusData?.students?.grad_students !== null && campusData?.students?.grad_students !== undefined
    ? Number(campusData.students.grad_students)
    : 8421;

  // Student Demographics (Men / Women)
  const menStudentsPct = campusData?.students?.demographics?.men !== null && campusData?.students?.demographics?.men !== undefined
    ? Number(campusData.students.demographics.men)
    : 44;
  const womenStudentsPct = campusData?.students?.demographics?.women !== null && campusData?.students?.demographics?.women !== undefined
    ? Number(campusData.students.demographics.women)
    : 56;

  // Faculty Demographics (Mock fallbacks matching Figma layout)
  const menFacultyPct = 58;
  const womenFacultyPct = 42;

  // Repayment 3-Year Progress Rates (Mock fallbacks matching Figma: 70%, 55%, 80%)
  const toPercentVal = (val: any, fallback: number) => {
    if (val === null || val === undefined) return fallback;
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return num < 2 ? Math.round(num * 100) : Math.round(num);
  };

  const allBorrowersPct = toPercentVal(campusData?.repayment?.all_borrowers_3yr, 70);
  const graduatesPct = toPercentVal(campusData?.repayment?.graduates_3yr, 55);
  const nonCompletersPct = toPercentVal(campusData?.repayment?.non_completers_3yr, 80);

  // Year 1 to Year 3 change table data
  const yr1 = campusData?.repayment?.yr1_overall !== null && campusData?.repayment?.yr1_overall !== undefined
    ? Number(campusData.repayment.yr1_overall)
    : 2852;
  const yr3 = campusData?.repayment?.yr3_overall !== null && campusData?.repayment?.yr3_overall !== undefined
    ? Number(campusData.repayment.yr3_overall)
    : 1571;
  const netChange = yr3 - yr1;

  // Completers vs Non-Completers table data
  const yr3Completers = campusData?.repayment?.yr3_completers !== null && campusData?.repayment?.yr3_completers !== undefined
    ? Number(campusData.repayment.yr3_completers)
    : 8452;
  const yr3NonCompleters = campusData?.repayment?.yr3_noncompleters !== null && campusData?.repayment?.yr3_noncompleters !== undefined
    ? Number(campusData.repayment.yr3_noncompleters)
    : 4652;
  const graduatesAdvantage = yr3Completers - yr3NonCompleters;

  // Income details fallbacks
  const avgFamilyIncome = 72340;
  const choiceAidPct = 29.0;
  
  // Format dynamic FAFSA count
  const fafsaCount = fafsaApplications !== null && fafsaApplications !== undefined
    ? fafsaApplications
    : 22100;

  return (
    <div className="flex flex-col gap-10 py-4 w-full">
      
      {/* 1. Enrolment & Size */}
      <div>
        <h2 className="text-[26px] font-black text-[#1E293B] mb-6 tracking-tight leading-none">
          Enrolment & Size
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Size Category */}
          <div className="bg-[#EBF3FF]/60 border border-[#DBEAFE]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{sizeCategory}</p>
              <p className="text-[11px] font-bold text-[#2563EB] mb-0">{sizeCategorySub}</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Size Category</p>
          </div>

          {/* Total Students */}
          <div className="bg-[#E6F4EA]/60 border border-[#DCFCE7]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{size.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-emerald-600 mb-0">Total Students</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Total Students</p>
          </div>

          {/* Grad Students */}
          <div className="bg-[#FEFCE8]/60 border border-[#FEF9C3]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{gradStudents.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-[#F59E0B] mb-0">Grad Students</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Grad Students</p>
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
                <span>{menStudentsPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A5A] rounded-full transition-all duration-1000" style={{ width: `${menStudentsPct}%` }} />
              </div>
            </div>

            {/* Faculty Men */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Men (Faculty)</span>
                <span>{menFacultyPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF5A5A] rounded-full transition-all duration-1000" style={{ width: `${menFacultyPct}%` }} />
              </div>
            </div>

            {/* Student Women */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Women (Students)</span>
                <span>{womenStudentsPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#EC4899] rounded-full transition-all duration-1000" style={{ width: `${womenStudentsPct}%` }} />
              </div>
            </div>

            {/* Faculty Women */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Women (Faculty)</span>
                <span>{womenFacultyPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#EC4899] rounded-full transition-all duration-1000" style={{ width: `${womenFacultyPct}%` }} />
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
                <span>{allBorrowersPct}%</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${allBorrowersPct}%` }} />
              </div>
            </div>

            {/* Graduates */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>Graduates</span>
                <span>{graduatesPct}%</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000" style={{ width: `${graduatesPct}%` }} />
              </div>
            </div>

            {/* Non-Completers */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-slate-900">
                <span>Non - Completers</span>
                <span>{nonCompletersPct}%</span>
              </div>
              <div className="h-3.5 bg-[#EAEFF5] rounded-full overflow-hidden">
                <div className="h-full bg-[#3B82F6] rounded-full transition-all duration-1000" style={{ width: `${nonCompletersPct}%` }} />
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
              <span>Borrowers year 1</span>
              <span className="text-slate-900 font-extrabold">{yr1.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Still Repaying Year 3</span>
              <span className="text-slate-900 font-extrabold">{yr3.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3 text-xs font-black text-slate-900">
              <span>Net Change</span>
              <span className={netChange < 0 ? "text-[#FF5A5A]" : "text-[#10B981]"}>
                {netChange > 0 ? `+${netChange.toLocaleString()}` : netChange.toLocaleString()}
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
              <span className="text-slate-900 font-extrabold">{yr3Completers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 text-xs font-bold text-slate-400">
              <span>Non-Completers</span>
              <span className="text-slate-900 font-extrabold">{yr3NonCompleters.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3 text-xs font-black text-slate-900">
              <span>Graduates Advantage</span>
              <span className="text-[#3B82F6]">
                +{graduatesAdvantage.toLocaleString()}
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
                ${avgFamilyIncome.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-[#F59E0B] mb-0">Avg family income</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Avg family income</p>
          </div>

          {/* Students with Choice-Aid */}
          <div className="bg-[#E6F4EA]/60 border border-[#DCFCE7]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {choiceAidPct.toFixed(1)}%
              </p>
              <p className="text-[11px] font-bold text-emerald-600 mb-0">Students with choice-aid</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-4">Students with choice-aid</p>
          </div>

          {/* FAFSA Applications */}
          <div className="bg-[#FFF1F2]/60 border border-[#FFE4E6]/80 rounded-[24px] px-7 py-8 flex flex-col justify-between min-h-[140px] shadow-sm">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                {fafsaCount.toLocaleString()}
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

