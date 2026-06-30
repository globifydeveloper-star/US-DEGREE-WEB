import React from "react";
import { ShieldCheck } from "lucide-react";

export default function TrustBanner() {
  return (
    <div className="bg-blue-600 text-white py-3">
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] flex items-center gap-2 text-sm">
        <ShieldCheck size={16} className="shrink-0" />
        <p>
          <span className="font-bold">Your Trust Guarantee:</span> All results
          are 100% unbiased. We never accept money from colleges for placement
          or ranking.
        </p>
      </div>
    </div>
  );
}
