import React from 'react';

interface StatsGridProps {
  totalStudents?: number | null;
  facultyRatio?: string | null;
  retentionRate?: string | null;
  programs?: number | null;
  fafsaApplications?: number | null;
  completionRate?: string | null;
}

export default function StatsGrid({
  totalStudents,
  facultyRatio,
  retentionRate,
  programs,
  fafsaApplications,
  completionRate
}: StatsGridProps) {
  const stats = [
    { 
      label: "TOTAL STUDENTS", 
      value: totalStudents !== null && totalStudents !== undefined ? totalStudents.toLocaleString() : "N/A", 
      bg: "bg-[#F0F2FF]", 
      textColor: "text-[#5365FF]", 
      labelColor: "text-[#5365FF]" 
    },
    { 
      label: "FACULTY RATIO", 
      value: facultyRatio || "N/A", 
      bg: "bg-[#F0FFF4]", 
      textColor: "text-[#2D9E4B]", 
      labelColor: "text-[#2D9E4B]" 
    },
    { 
      label: "RETENTION RATE", 
      value: retentionRate || "N/A", 
      bg: "bg-[#FFF9EE]", 
      textColor: "text-[#D97706]", 
      labelColor: "text-[#D97706]" 
    },
    { 
      label: "PROGRAMS", 
      value: programs !== null && programs !== undefined ? String(programs) : "N/A", 
      bg: "bg-[#F0FBFF]", 
      textColor: "text-[#0891B2]", 
      labelColor: "text-[#0891B2]" 
    },
    { 
      label: "FAFSA APPLICATION", 
      value: fafsaApplications !== null && fafsaApplications !== undefined ? fafsaApplications.toLocaleString() : "N/A", 
      bg: "bg-[#FFF1F2]", 
      textColor: "text-[#E11D48]", 
      labelColor: "text-[#E11D48]" 
    },
    { 
      label: "COMPLETION", 
      value: completionRate || "N/A", 
      bg: "bg-[#F5F3FF]", 
      textColor: "text-[#7C3AED]", 
      labelColor: "text-[#7C3AED]" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 my-10">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.bg} rounded-3xl p-8 flex flex-col justify-center min-h-[140px]`}>
          <p className={`text-[11px] font-black uppercase tracking-[0.1em] mb-3 ${stat.labelColor}`}>
            {stat.label}
          </p>
          <p className={`text-4xl font-extrabold ${stat.textColor}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
