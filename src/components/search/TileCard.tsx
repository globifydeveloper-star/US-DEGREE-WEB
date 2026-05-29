import React from 'react';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { ResultCardProps } from './ResultCard';

export default function TileCard({
  id = 1,
  cipCode,
  university,
  location,
  degree,
  schoolType,
  admissionRate,
  gradRate,
  avgSalary,
  estCost,
  roi,
  logoColor,
}: ResultCardProps) {
  const universityHref = {
    pathname: `/university/${id}`,
    query: {
      cip: cipCode,
      name: university,
      city: location.split(", ")[0] || "",
      state: location.split(", ")[1] || "",
      degree: degree,
      type: schoolType,
      admissionRate: admissionRate,
      tuition: estCost,
      avgSalary: avgSalary,
      roi: roi,
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2 items-center min-w-0">
          <div className={`w-9 h-9 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-base shrink-0`}>
            {university.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link href={universityHref}>
              <h2 className="text-sm font-bold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">{university}</h2>
            </Link>
            <div className="flex items-center text-gray-400 text-[11px] mt-0.5">
              <MapPin size={10} className="mr-0.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-200 hover:text-red-400 transition shrink-0">
          <Heart size={16} />
        </button>
      </div>

      {/* School type badge */}
      {schoolType && (
        <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          schoolType.toLowerCase().includes('public')
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-purple-50 border-purple-100 text-purple-700'
        }`}>
          {schoolType.split(',')[0]}
        </span>
      )}

      {/* Degree */}
      <h3 className="text-[11px] font-bold text-red-500 leading-snug line-clamp-2">{degree}</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">Admission</p>
          <p className="text-xs font-bold text-gray-900">{admissionRate}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">20yr ROI</p>
          <p className="text-xs font-bold text-blue-600">{roi ?? 'N/A'}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">Avg. Salary</p>
          <p className="text-xs font-bold text-green-600">{avgSalary ?? 'N/A'}</p>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">Employment</p>
          <p className="text-xs font-bold text-gray-900">{gradRate > 0 ? `${gradRate}%` : 'N/A'}</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={universityHref}
        className="mt-auto block text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-[11px] font-bold transition"
      >
        View Details
      </Link>
    </div>
  );
}
