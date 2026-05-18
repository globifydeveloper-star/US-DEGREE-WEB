import React from 'react';

interface ProgramDetailProps {
  degree: string;
  cipCode: string;
  school: string;
  description: string;
}

export default function ProgramDetail({ degree, cipCode, school, description }: any) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6 inline-block border-b-[6px] border-black pb-1 leading-none">
        {degree}
      </h2>
      
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6">
        <span>CIP Code: {cipCode}</span>
        <span className="text-gray-300">•</span>
        <span>{school}</span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
        {description}
      </p>
    </div>
  );
}
