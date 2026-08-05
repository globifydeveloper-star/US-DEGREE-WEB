import React from "react";
import { Building2 } from "lucide-react";

export default function EmptyComparisonState() {
  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl p-6 sm:p-16 text-center max-w-2xl mx-auto my-6 sm:my-12">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 text-[#3F51B5] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <Building2 className="w-8 h-8 sm:w-12 sm:h-12" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
        No programs selected for comparison
      </h3>
      <p className="text-gray-500 font-medium text-sm sm:text-base mb-8 sm:mb-10 max-w-md mx-auto leading-relaxed">
        Select up to 5 programs and see how they compare side by side.
      </p>
    </div>
  );
}
