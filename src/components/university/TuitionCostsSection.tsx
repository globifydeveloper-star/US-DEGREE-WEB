import React, { useState } from 'react';

interface TuitionCostsSectionProps {
  tuitionData?: {
    tuition: {
      tuition_in_state: number | null;
      tuition_out_state: number | null;
      booksupply: number | null;
    };
    housing: {
      roomboard_oncampus: number | null;
      roomboard_offcampus: number | null;
    };
    expenses: {
      otherexpense_oncampus: number | null;
      otherexpense_offcampus: number | null;
      otherexpense_withfamily: number | null;
    };
    financial_aid: {
      aid_percentage: number | null;
      students_with_any_loan: number | null;
      loan_principal: number | null;
    };
    school_type: string | null;
    net_price: {
      income_0_30000: number | null;
      income_30001_48000: number | null;
      income_48001_75000: number | null;
      income_75001_110000: number | null;
      income_110001_plus: number | null;
    };
  } | null;
  schoolName?: string;
}

export default function TuitionCostsSection({ tuitionData, schoolName = "this university" }: TuitionCostsSectionProps) {
  // Fallbacks if database has nulls or if tuitionData is absent
  const tuitionInState = tuitionData?.tuition?.tuition_in_state ?? 12714;
  const tuitionOutState = tuitionData?.tuition?.tuition_out_state ?? 25000;
  const bookSupply = tuitionData?.tuition?.booksupply ?? 1200;
  
  const roomBoardOnCampus = tuitionData?.housing?.roomboard_oncampus ?? 7348;
  const roomBoardOffCampus = tuitionData?.housing?.roomboard_offcampus ?? 8500;
  
  const otherExpenseOnCampus = tuitionData?.expenses?.otherexpense_oncampus ?? 2832;
  const otherExpenseOffCampus = tuitionData?.expenses?.otherexpense_offcampus ?? 3200;
  const otherExpenseWithFamily = tuitionData?.expenses?.otherexpense_withfamily ?? 2000;
  
  const aidPercentage = tuitionData?.financial_aid?.aid_percentage ?? 70;
  const studentsWithLoan = tuitionData?.financial_aid?.students_with_any_loan != null 
    ? Math.round(tuitionData.financial_aid.students_with_any_loan * 100) 
    : 50;
  const averageLoan = tuitionData?.financial_aid?.loan_principal ?? 6500;
  
  const netPrices = {
    "0-30000": tuitionData?.net_price?.income_0_30000 ?? 8500,
    "30001-48000": tuitionData?.net_price?.income_30001_48000 ?? 9500,
    "48001-75000": tuitionData?.net_price?.income_48001_75000 ?? 12500,
    "75001-110000": tuitionData?.net_price?.income_75001_110000 ?? 16800,
    "110001+": tuitionData?.net_price?.income_110001_plus ?? 21000,
  };

  // Sticker Price Calculations
  const stickerInState = bookSupply + tuitionInState + roomBoardOnCampus + otherExpenseOnCampus;
  const stickerOutState = bookSupply + tuitionOutState + roomBoardOnCampus + otherExpenseOnCampus;

  // Active tuition view
  const [tuitionType, setTuitionType] = useState<'in_state' | 'out_state'>('in_state');
  const activeTuition = tuitionType === 'in_state' ? tuitionInState : tuitionOutState;
  const activeStickerPrice = tuitionType === 'in_state' ? stickerInState : stickerOutState;

  // Continuous Income Slider State
  const [sliderValue, setSliderValue] = useState<number>(23144);
  const [incomeRange, setIncomeRange] = useState<keyof typeof netPrices>("0-30000");

  const getNetPriceForRange = (range: keyof typeof netPrices) => {
    return netPrices[range];
  };

  const handleSliderChange = (val: number) => {
    setSliderValue(val);
    if (val <= 30000) {
      setIncomeRange("0-30000");
    } else if (val <= 48000) {
      setIncomeRange("30001-48000");
    } else if (val <= 75000) {
      setIncomeRange("48001-75000");
    } else if (val <= 110000) {
      setIncomeRange("75001-110000");
    } else {
      setIncomeRange("110001+");
    }
  };

  const handleBracketClick = (range: keyof typeof netPrices) => {
    setIncomeRange(range);
    if (range === "0-30000") {
      setSliderValue(15000);
    } else if (range === "30001-48000") {
      setSliderValue(39000);
    } else if (range === "48001-75000") {
      setSliderValue(61500);
    } else if (range === "75001-110000") {
      setSliderValue(92500);
    } else {
      setSliderValue(130000);
    }
  };

  const currentNetPrice = getNetPriceForRange(incomeRange);
  // Formula: sticker price - net price = Estimated Financial Aid
  const currentFinAid = Math.max(0, activeStickerPrice - currentNetPrice);

  const formatCurrency = (val: number): string => {
    return `$${Math.round(val).toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl font-sans">
      
      {/* 1. Cost of Attendance Header Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Cost of Attendance</h2>
            <p className="text-xs text-gray-400 font-bold mt-1">Estimated annual expenses before any financial aid is applied.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl self-start">
            <button 
              onClick={() => setTuitionType('in_state')}
              className={`px-4 py-2 text-xs font-bold transition-all rounded-xl ${
                tuitionType === 'in_state' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              In-State
            </button>
            <button 
              onClick={() => setTuitionType('out_state')}
              className={`px-4 py-2 text-xs font-bold transition-all rounded-xl ${
                tuitionType === 'out_state' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Out-of-State
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tuition card */}
          <div className="bg-[#EEF2FF] border border-indigo-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
              {tuitionType === 'in_state' ? 'Tuition (In-State)' : 'Tuition (Out-of-State)'}
            </p>
            <p className="text-3xl font-black text-indigo-900 tracking-tight">{formatCurrency(activeTuition)}</p>
          </div>

          {/* Books card */}
          <div className="bg-[#FFF1F2] border border-rose-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Books & Supplies</p>
            <p className="text-3xl font-black text-rose-900 tracking-tight">{formatCurrency(bookSupply)}</p>
          </div>

          {/* Housing card */}
          <div className="bg-[#ECFDF5] border border-emerald-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Housing & Food</p>
            <p className="text-3xl font-black text-emerald-900 tracking-tight">{formatCurrency(roomBoardOnCampus)}</p>
          </div>

          {/* Other Expenses card */}
          <div className="bg-[#FFFBEB] border border-amber-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-h-[110px]">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Other Living Expenses</p>
            <p className="text-3xl font-black text-amber-950 tracking-tight">{formatCurrency(otherExpenseOnCampus)}</p>
          </div>
        </div>
      </div>

      {/* 2. Financial Aid & Loans Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Aid percentage card */}
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-6.5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-[#16A34A] uppercase tracking-[0.1em] mb-2">RECEIVE FINANCIAL AID</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight mb-3">
              {aidPercentage}%
            </p>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Students receive grants or scholarships to help make the cost of attending college more affordable.
            </p>
          </div>
          <div className="w-full bg-gray-150 h-2 rounded-full mt-4">
            <div className="bg-[#16A34A] h-2 rounded-full transition-all duration-500" style={{ width: `${aidPercentage}%` }} />
          </div>
        </div>

        {/* Any Loan percentage card */}
        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-3xl p-6.5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.1em] mb-2">STUDENTS WITH ANY LOAN</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight mb-3">
              {studentsWithLoan}%
            </p>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Percentage of full-time undergraduate students who rely on federal student loans to pay for school.
            </p>
          </div>
          <div className="w-full bg-gray-150 h-2 rounded-full mt-4">
            <div className="bg-[#2563EB] h-2 rounded-full transition-all duration-500" style={{ width: `${studentsWithLoan}%` }} />
          </div>
        </div>

        {/* Average loan card */}
        <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-3xl p-6.5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-[#9333EA] uppercase tracking-[0.1em] mb-2">AVERAGE LOAN PRINCIPAL</p>
            <p className="text-4xl font-black text-gray-900 tracking-tight mb-3">
              {formatCurrency(averageLoan)}
            </p>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              The typical total debt accumulated by students who borrow federal student loans for their studies.
            </p>
          </div>
          <div className="w-full h-2 rounded-full mt-4 bg-purple-100/50" />
        </div>
      </div>

      {/* 3. Sticker Price Break Down Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sticker Price Breakdown</h2>
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Expense Category</th>
                <th className="py-4 px-6 text-right">Estimated Cost / Year</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700 divide-y divide-gray-50 font-semibold">
              <tr>
                <td className="py-4 px-6 text-gray-500 font-bold">Tuition Fees ({tuitionType === 'in_state' ? 'In-State' : 'Out-of-State'})</td>
                <td className="py-4 px-6 text-right text-gray-900">{formatCurrency(activeTuition)}</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-500 font-bold">Books & Supplies</td>
                <td className="py-4 px-6 text-right text-gray-900">{formatCurrency(bookSupply)}</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-500 font-bold">Room & Board (On-Campus)</td>
                <td className="py-4 px-6 text-right text-gray-900">{formatCurrency(roomBoardOnCampus)}</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-500 font-bold">Other On-Campus Living Expenses</td>
                <td className="py-4 px-6 text-right text-gray-900">{formatCurrency(otherExpenseOnCampus)}</td>
              </tr>
              <tr className="bg-gray-50/50 text-sm font-black text-gray-900">
                <td className="py-4 px-6">Total Sticker Price</td>
                <td className="py-4 px-6 text-right text-blue-600">{formatCurrency(activeStickerPrice)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Family Income & Net Price Calculator */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Net Price Calculator</h2>
        <p className="text-xs text-gray-400 font-bold mb-6">Estimate your actual net cost based on your family income bracket.</p>
        
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
          
          {/* A Premium, Interactive Slider Container */}
          <div className="bg-[#FFF1F2]/60 border border-rose-100 rounded-[28px] p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex flex-col text-left shrink-0">
              <span className="text-base font-black text-rose-900">Family Income</span>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mt-0.5">Drag to set your annual income</span>
            </div>
            
            {/* The Custom Range Input */}
            <div className="flex-1 w-full flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={sliderValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-blue-600 transition-all focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(sliderValue / 150000) * 100}%, #E5E7EB ${(sliderValue / 150000) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
            
            {/* Displaying Slider Value */}
            <div className="bg-white px-5 py-2.5 rounded-2xl border border-rose-100 shadow-sm shrink-0 min-w-[120px] text-center">
              <span className="text-lg font-black text-rose-900 tracking-tight">
                {formatCurrency(sliderValue)}
              </span>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sticker Price */}
            <div className="bg-amber-50/60 border border-amber-100/60 rounded-2xl p-5 flex flex-col justify-center min-h-[90px]">
              <span className="text-[9px] font-bold text-amber-600 uppercase mb-1">Sticker Price</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(activeStickerPrice)}</span>
            </div>

            {/* Estimated Financial Aid */}
            <div className="bg-[#E0F2FE] border border-blue-100 rounded-2xl p-5 flex flex-col justify-center min-h-[90px]">
              <span className="text-[9px] font-bold text-blue-600 uppercase mb-1">Estimated Financial Aid</span>
              <span className="text-2xl font-black text-blue-700 tracking-tight">{formatCurrency(currentFinAid)}</span>
            </div>

            {/* Your Net Price */}
            <div className="bg-[#FDF4FF] border border-purple-100 rounded-2xl p-5 flex flex-col justify-center min-h-[90px]">
              <span className="text-[9px] font-bold text-purple-600 uppercase mb-1">Your Net Price</span>
              <span className="text-2xl font-black text-purple-800 tracking-tight">{formatCurrency(currentNetPrice)} <span className="text-xs font-semibold text-purple-500">/ yr</span></span>
            </div>
          </div>

          {/* List of Bracket Prices */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Net Price by Income Bracket</span>
            {(Object.keys(netPrices) as Array<keyof typeof netPrices>).map((range) => {
              const isActive = incomeRange === range;
              const netPriceVal = getNetPriceForRange(range);
              return (
                <div
                  key={range}
                  onClick={() => handleBracketClick(range)}
                  className={`flex justify-between items-center px-6 py-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/40 border-blue-200 text-blue-900 font-extrabold shadow-sm transform scale-[1.005]'
                      : 'bg-white border-gray-100 text-gray-700 font-semibold hover:bg-gray-50/50'
                  }`}
                >
                  <span className="text-xs uppercase tracking-wide">
                    {range === '110001+' ? '$110,001+' : range.split('-').map(v => `$${Number(v).toLocaleString()}`).join(' - ')}
                  </span>
                  <span className={`text-sm ${isActive ? 'text-blue-600 font-black' : 'text-gray-900'}`}>
                    {formatCurrency(netPriceVal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
