"use client";

import React, { useState } from 'react';

const tabs = [
  "Overview",
  "Programs & Academics",
  "Admissions",
  "Outcomes & Careers",
  "Tuition & Costs",
  "Campus & Students",
];

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px]">
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
