import React from "react";

export default function ProBanner() {
  return (
    <section className="px-6 sm:px-10 lg:px-[86px] py-12 flex justify-center">
      <div className="w-full max-w-[2380px] bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-blue-900/20">
        
        {/* LEFT TEXT */}
        <div className="text-white max-w-lg">
          <h2 className="text-3xl font-bold mb-4">Unlock Earnings Insights Pro</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Get access to exclusive salary data for every major, including 
            projected 10-year earnings and life-long returns.
          </p>
        </div>

        {/* RIGHT ACTION */}
        <div className="flex flex-col items-center bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 min-w-[200px]">
          <span className="text-blue-200 text-xs font-bold tracking-wider mb-1">ANNUAL PLAN</span>
          {/* <div className="text-white mb-4">
            <span className="text-3xl font-extrabold">$39</span>
            <span className="text-sm text-blue-200"> / year</span>
          </div> */}
          <button className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-sm w-full hover:bg-gray-50 transition-colors shadow-lg">
            Go Pro Today
          </button>
        </div>

      </div>
    </section>
  );
}
