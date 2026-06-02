'use client';

import React from 'react';

export default function CompareHeader() {
  return (
    <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-6">
      <div>
        <div className="flex items-center gap-2 justify-center lg:justify-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#3F51B5] bg-blue-50 px-3 py-1 rounded-full">
            Interactive Decision Engine
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
          Compare <span className="text-[#3F51B5]">U.S. Colleges</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg mt-2 tracking-tight">
          Compare academic metrics, annual tuition fees, and career outcomes.
        </p>
      </div>
    </div>
  );
}
