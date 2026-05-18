import React from 'react';
import Link from 'next/link';
import { Heart, Clock, BookOpen, MapPin } from 'lucide-react';

export interface ResultCardProps {
  id?: number | string;
  cipCode?: string;
  university: string;
  location: string;
  degree: string;
  schoolType?: string;
  admissionRate: string;
  avgGpa: string;
  satAct: string;
  duration: string;
  specializations: string;
  matchScore: number;
  gradRate: number;
  avgSalary?: string;
  estCost?: string;
  medianSalary?: string;
  roi?: string;
  logoColor: string;
}

export default function ResultCard({
  id = 1,
  cipCode,
  university,
  location,
  degree,
  schoolType,
  admissionRate,
  avgGpa,
  satAct,
  duration,
  specializations,
  matchScore,
  gradRate,
  roi,
  estCost,
  avgSalary,
  medianSalary,
  logoColor
}: ResultCardProps) {

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-4 items-start">
          <div className={`w-10 h-10 rounded-lg ${logoColor} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
            {university.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{university}</h2>
            <div className="flex items-center text-gray-500 text-xs mt-0.5">
              <MapPin size={12} className="mr-1" />
              {location}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button className="text-gray-300 hover:text-red-500 transition">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Match Badge (Absolute on Desktop, regular flow on mobile) */}
      <div className="hidden md:flex absolute top-5 right-5 flex-col items-center bg-blue-50/50 border border-blue-100 rounded-xl p-2.5 w-24">
        <span className="text-[9px] font-bold text-blue-600 uppercase mb-1 text-center leading-tight">Match for your profile!</span>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 stroke-current"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" strokeWidth="3"
            />
            <path
              className="text-blue-600 stroke-current"
              strokeDasharray={`${matchScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" strokeWidth="3"
            />
          </svg>
          <span className="absolute text-xs font-bold text-blue-900">{matchScore}%</span>
        </div>
      </div>

      {/* Degree Info */}
      <div className="mb-5 md:pr-28">
        <h3 className="text-sm text-red-500 font-bold mb-2">{degree}</h3>
        
        <div className="flex flex-wrap gap-5 mb-3">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Admission Rate</p>
            <p className="font-bold text-gray-900 text-xs">{admissionRate}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Avg. GPA</p>
            <p className="font-bold text-gray-900 text-xs">{avgGpa}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">SAT/ACT</p>
            <p className="font-bold text-gray-900 text-xs">{satAct}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
          <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded-md border border-gray-100">
            <Clock size={10} className="text-gray-400" />
            {duration}
          </span>
          {schoolType && (
            <span className={`flex items-center gap-1 px-1.5 py-1 rounded-md border font-bold ${
              schoolType.toLowerCase().includes('public') 
                ? 'bg-green-50 border-green-100 text-green-700' 
                : 'bg-purple-50 border-purple-100 text-purple-700'
            }`}>
              {schoolType.split(',')[0]}
            </span>
          )}
          <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded-md border border-gray-100">
            <BookOpen size={10} className="text-gray-400" />
            Specializations: {specializations}
          </span>
        </div>
      </div>

      {/* Stat Tiles */}
      <div className="flex flex-wrap gap-3 py-4 border-y border-gray-100 mb-4">
        
        {/* Employment Rate */}
        <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Employment Rate</span>
          <span className="text-sm font-extrabold text-gray-900">
            {gradRate > 0 ? `${gradRate}%` : 'N/A'}
          </span>
        </div>

        <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Median Salary</span>
          <span className="text-sm font-extrabold text-green-600">{medianSalary ?? 'N/A'}</span>
        </div>

        {/* 20yr ROI */}
        <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px]">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">20yr ROI</span>
          <span className="text-sm font-extrabold text-blue-600">
            {roi ?? 'N/A'}
          </span>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
          <span className="text-[11px] font-medium text-gray-600">Compare</span>
        </label>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-[11px] font-bold transition">
            Visit Website
          </button>
          <Link
            href={{
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
                avgSalary: avgSalary || medianSalary,
                roi: roi,
              }
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-[11px] font-bold transition text-center"
          >
            View Full Details
          </Link>
        </div>
      </div>

    </div>
  );
}
