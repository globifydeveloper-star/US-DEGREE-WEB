import React from 'react';

interface AboutSectionProps {
  name: string;
  description: string;
  degree?: string;
  duration?: string;
  format?: string;
  financialAid?: string;
}

export default function AboutSection({ name, description }: AboutSectionProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
        About {name}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 leading-7 max-w-4xl">
        {description}
      </p>
    </div>
  );
}
