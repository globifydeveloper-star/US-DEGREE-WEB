import React, { useState, useEffect } from 'react';
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
  schoolUrl,
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

  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    setIsCompared(list.includes(String(id)));

    const handleUpdate = () => {
      const updatedList = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
      setIsCompared(updatedList.includes(String(id)));
    };

    window.addEventListener('compared-colleges-updated', handleUpdate);
    return () => window.removeEventListener('compared-colleges-updated', handleUpdate);
  }, [id]);

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    let list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    let detailsList = JSON.parse(localStorage.getItem('compared_colleges_details') || '[]');
    if (checked) {
      if (list.length >= 5) {
        alert("You can compare a maximum of 5 colleges simultaneously.");
        return;
      }
      if (!list.includes(String(id))) {
        list.push(String(id));
        const formattedSchoolUrl = schoolUrl
          ? (schoolUrl.trim().startsWith("http://") || schoolUrl.trim().startsWith("https://")
            ? schoolUrl.trim()
            : `https://${schoolUrl.trim()}`)
          : "";

        detailsList.push({
          id: String(id),
          name: university,
          logoColor: logoColor || 'bg-blue-600',
          location: location,
          cipCode: cipCode || 'default',
          schoolUrl: formattedSchoolUrl
        });
      }
    } else {
      list = list.filter((cid: string) => cid !== String(id));
      detailsList = detailsList.filter((c: any) => c.id !== String(id));
    }
    localStorage.setItem('compared_colleges', JSON.stringify(list));
    localStorage.setItem('compared_colleges_details', JSON.stringify(detailsList));
    setIsCompared(checked);
    window.dispatchEvent(new Event('compared-colleges-updated'));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 sm:gap-3 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1.5 sm:gap-2 items-center min-w-0">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0 shadow-sm`}>
            {university.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link href={universityHref}>
              <h2 className="text-xs sm:text-sm font-bold text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">{university}</h2>
            </Link>
            <div className="flex items-center text-gray-400 text-[9px] sm:text-[11px] mt-0.5">
              <MapPin size={9} className="mr-0.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
        <button className="text-gray-200 hover:text-red-400 transition shrink-0 hidden sm:block">
          <Heart size={14} />
        </button>
      </div>

      {/* School type badge */}
      {schoolType && (
        <span className={`self-start text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${
          schoolType.toLowerCase().includes('public')
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-purple-50 border-purple-100 text-purple-700'
        }`}>
          {schoolType.split(',')[0]}
        </span>
      )}

      {/* Degree */}
      <h3 className="text-[10px] sm:text-[11px] font-bold text-red-500 leading-snug line-clamp-2">{degree}</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-1.5">
        <div>
          <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">Admission</p>
          <p className="text-[10px] sm:text-xs font-bold text-gray-900">{admissionRate}</p>
        </div>
        <div>
          <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">20yr ROI</p>
          <p className="text-[10px] sm:text-xs font-bold text-blue-600">{roi ?? 'N/A'}</p>
        </div>
        <div>
          <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">Avg. Salary</p>
          <p className="text-[10px] sm:text-xs font-bold text-green-600">{avgSalary ?? 'N/A'}</p>
        </div>
        <div>
          <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-semibold">Employment</p>
          <p className="text-[10px] sm:text-xs font-bold text-gray-900">{gradRate > 0 ? `${gradRate}%` : 'N/A'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-1 border-t border-gray-50 pt-2.5">
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={handleCompareChange}
            className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-[9px] sm:text-[11px] font-medium text-gray-600">Compare</span>
        </label>
        <Link
          href={universityHref}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-bold transition whitespace-nowrap"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
