import React from 'react';

interface AboutSectionProps {
  name: string;
  description: string;
  degree: string;
  duration: string;
  format: string;
  financialAid: string;
}

export default function AboutSection({ name, description }: any) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6 inline-block border-b-[6px] border-black pb-1 leading-none">
        About {name}
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
        {description}
      </p>
    </div>
  );
}
