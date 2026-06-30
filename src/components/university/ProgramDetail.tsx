import React from "react";
import { ProgramDetailProps } from "@/types/university/ProgramDetail";

export default function ProgramDetail({
  degree,
  cipCode,
  description,
}: ProgramDetailProps) {
  return (
    <div className="mb-10">
      <h2 className="text-[28px] font-bold text-slate-900 mb-3 font-['Lexend'] inline-block border-b-[3px] border-slate-900 pb-1 leading-none">
        {degree}
      </h2>
      <p className="text-sm font-semibold text-slate-500 font-['Lexend'] mb-5">
        CIP Code: {cipCode}
      </p>
      <p className="text-slate-500 text-base leading-relaxed font-['Poppins'] max-w-4xl">
        {description}
      </p>
    </div>
  );
}
