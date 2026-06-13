'use client';

import React from 'react';
import Image from 'next/image';
import {
  MapPin,
  Trash2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button, Tooltip } from 'antd';
import { College } from '@/types/university/ComparisonTable';

interface ComparisonTableProps {
  comparedColleges: College[];
  averages: { tuition: number; graduationRate: number; medianSalary: number };
  highlights: { lowestTuitionId: string; highestGraduationId: string; highestSalaryId: string; bestValueId: string };
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function ComparisonTable({
  comparedColleges,
  averages,
  highlights,
  onRemove,
  onViewDetails,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto overflow-y-clip rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-left border-collapse table-fixed min-w-[768px] md:min-w-[1000px]">
        {/* Sticky Header Row */}
        <thead>
          <tr className="border-b border-gray-100 bg-[#FAFBFD]/90 backdrop-blur sticky z-20">
            <th className="w-36 md:w-80 p-4 md:p-8 font-black text-slate-900 text-xs md:text-lg sticky  left-0 bg-[#FAFBFD] z-30 border-r border-gray-100">
              Institutional Criteria
            </th>
            {comparedColleges.map((college) => {
              const isBestValue = highlights.bestValueId === college.id;
              const isHighSalary = highlights.highestSalaryId === college.id;
              const isLowestCost = highlights.lowestTuitionId === college.id;

              return (
                <th key={college.id} className="p-4 md:p-8 relative min-w-[140px] md:min-w-[200px] sticky bg-[#FAFBFD] z-20">
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-40">
                    <Tooltip title="Remove college">
                      <Button
                        type="text"
                        shape="circle"
                        size="small"
                        icon={<Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500" />}
                        onClick={() => onRemove(college.id)}
                      />
                    </Tooltip>
                  </div>

                  <div className="flex flex-col items-center text-center pt-2">
                    {/* Logo */}
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-white border border-gray-100 rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center justify-center mb-2 md:mb-4 shadow-sm hover:scale-105 transition-transform overflow-hidden">
                      {college.logo ? (
                        <Image
                          src={college.logo}
                          alt={college.name}
                          width={56}
                          height={56}
                          className="object-contain max-h-full max-w-full w-8 h-8 md:w-14 md:h-14"
                          referrerPolicy="no-referrer"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-blue-100 flex items-center justify-center font-bold text-[#3F51B5] text-sm md:text-lg">
                          {college.name ? college.name.charAt(0) : 'U'}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs md:text-lg font-black text-slate-900 line-clamp-1">
                      {college.shortName}
                    </h3>
                    <p className="text-[9px] md:text-xs text-gray-400 font-bold flex items-center gap-0.5 md:gap-1 mt-0.5 md:mt-1 justify-center">
                      <MapPin className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                      {college.location}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-col items-center gap-1 mt-2 md:mt-4 min-h-[36px] md:min-h-[48px]">
                      {isBestValue && (
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#22C55E] bg-green-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md border border-green-100 flex items-center gap-0.5 md:gap-1">
                          <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> Best ROI
                        </span>
                      )}
                      {isHighSalary && !isBestValue && (
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#3F51B5] bg-blue-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md border border-blue-100">
                          💰 Salary Leader
                        </span>
                      )}
                      {isLowestCost && (
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md border border-emerald-100">
                          📉 Lowest Cost
                        </span>
                      )}
                      {!isBestValue && !isHighSalary && !isLowestCost && (
                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100/80 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md">
                          {college.isPrivate ? 'Private' : 'Public'}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-100">
          {/* Tuition In-State */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Tuition (In-State)</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Annual tuition & tuition fees</p>
              </div>
            </td>
            {comparedColleges.map((college) => (
              <td key={college.id} className="p-4 md:p-8 text-center font-mono">
                <span className="text-sm md:text-xl font-bold text-slate-900">
                  {college.tuitionInState !== null ? `$${college.tuitionInState.toLocaleString()}` : 'N/A'}
                </span>
                {college.tuitionInState !== null && (
                  <span className="block text-gray-400 text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1">per year</span>
                )}
              </td>
            ))}
          </tr>

          {/* Tuition Out-of-State */}
          <tr className="hover:bg-slate-50/35 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Tuition (Out-of-State)</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">National student baseline rate</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.tuitionOutOfState === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              const diffVal = college.tuitionOutOfState - averages.tuition;
              const percentDiff = averages.tuition > 0 ? Math.round((diffVal / averages.tuition) * 100) : 0;
              const isBest = highlights.lowestTuitionId === college.id;

              return (
                <td key={college.id} className="p-4 md:p-8 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm md:text-xl font-black ${isBest ? 'text-green-600 font-bold' : 'text-slate-900'}`}>
                      ${college.tuitionOutOfState.toLocaleString()}
                    </span>

                    {comparedColleges.length > 1 && (
                      <div className="mt-1 md:mt-2 flex items-center gap-0.5 md:gap-1">
                        {diffVal < 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-md flex items-center">
                            <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            {Math.abs(percentDiff)}% lower
                          </span>
                        ) : diffVal > 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 md:px-2 py-0.5 rounded-md flex items-center">
                            <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            +{percentDiff}% avg
                          </span>
                        ) : (
                          <span className="text-[8px] md:text-[10px] font-medium text-gray-400">Average</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Acceptance Rate */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Acceptance Rate</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Selectivity benchmark percentage</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.acceptanceRate === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              const isHighlyCompetitive = college.acceptanceRate < 0.08;
              const isCompetitive = college.acceptanceRate < 0.2;

              return (
                <td key={college.id} className="p-4 md:p-8 text-center">
                  <span className="text-sm md:text-xl font-bold text-slate-900">
                    {(college.acceptanceRate * 100).toFixed(1)}%
                  </span>
                  <span className={`block text-[8px] md:text-[9px] font-black uppercase mt-1 md:mt-1.5 px-1.5 md:px-2 py-0.5 rounded-md mx-auto w-max ${isHighlyCompetitive ? 'bg-red-50 text-red-600' : isCompetitive ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {isHighlyCompetitive ? 'Selective' : isCompetitive ? 'Competitive' : 'Match'}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Graduation Rate */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Graduation Rate</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Percent completing within 6 years</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.graduationRate === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              const isHero = highlights.highestGraduationId === college.id;
              const diffRatio = (college.graduationRate - averages.graduationRate) * 100;

              return (
                <td key={college.id} className="p-4 md:p-8 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm md:text-xl font-black ${isHero ? 'text-green-600' : 'text-slate-900'}`}>
                      {(college.graduationRate * 100).toFixed(0)}%
                    </span>

                    {comparedColleges.length > 1 && (
                      <div className="mt-1 md:mt-2 flex items-center gap-0.5 md:gap-1">
                        {isHero ? (
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-md">
                            🏆 Highest
                          </span>
                        ) : diffRatio > 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-green-500 flex items-center">
                            <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            +{diffRatio.toFixed(0)}% avg
                          </span>
                        ) : diffRatio < 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-gray-400 flex items-center">
                            <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            {Math.abs(diffRatio).toFixed(0)}% avg
                          </span>
                        ) : (
                          <span className="text-[8px] md:text-[10px] font-medium text-gray-400">Average</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* SAT Score Range */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">SAT Score Range</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Middle 50th percentile bounds</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.satMin === null || college.satMax === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              return (
                <td key={college.id} className="p-4 md:p-8 text-center font-mono">
                  <span className="text-xs md:text-lg font-bold text-slate-900">
                    {college.satMin} — {college.satMax}
                  </span>
                  <span className="block text-gray-400 text-[8px] md:text-[10px] mt-0.5 md:mt-1 font-bold">1600 Max</span>
                </td>
              );
            })}
          </tr>

          {/* Median Graduate Salary */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Median Graduate Salary</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Outcomes after 10 years</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.medianSalary === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              const isTop = highlights.highestSalaryId === college.id;
              const diffPerc = averages.medianSalary > 0 ? Math.round(((college.medianSalary - averages.medianSalary) / averages.medianSalary) * 100) : 0;

              return (
                <td key={college.id} className="p-4 md:p-8 text-center font-mono">
                  <div className="flex flex-col items-center">
                    <span className={`text-sm md:text-xl font-black ${isTop ? 'text-[#3F51B5]' : 'text-slate-900'}`}>
                      ${college.medianSalary.toLocaleString()}
                    </span>

                    {comparedColleges.length > 1 && (
                      <div className="mt-1 md:mt-2 flex items-center gap-0.5 md:gap-1">
                        {isTop ? (
                          <span className="text-[8px] md:text-[10px] font-black uppercase text-[#3F51B5] bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-md">
                            ⭐ Top salary
                          </span>
                        ) : diffPerc > 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-md flex items-center animate-pulse">
                            <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            +{diffPerc}% avg
                          </span>
                        ) : diffPerc < 0 ? (
                          <span className="text-[8px] md:text-[10px] font-bold text-gray-400 flex items-center">
                            <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                            {Math.abs(diffPerc)}% avg
                          </span>
                        ) : (
                          <span className="text-[8px] md:text-[10px] font-medium text-gray-400">Average</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Student Enrollment */}
          <tr className="hover:bg-slate-50/30 transition-colors">
            <td className="p-4 md:p-8 sticky left-0 bg-white font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Student Enrollment</p>
                <p className="text-[8px] md:text-[10px] font-semibold text-gray-400 mt-0.5">Total size (undergrad + grad)</p>
              </div>
            </td>
            {comparedColleges.map((college) => {
              if (college.studentPopulation === null) {
                return (
                  <td key={college.id} className="p-4 md:p-8 text-center font-mono text-sm md:text-xl font-bold text-slate-400">
                    N/A
                  </td>
                );
              }

              return (
                <td key={college.id} className="p-4 md:p-8 text-center font-mono">
                  <span className="text-sm md:text-xl font-bold text-slate-900">
                    {college.studentPopulation.toLocaleString()}
                  </span>
                  <span className="block text-gray-400 text-[8px] md:text-[10px] font-bold uppercase mt-0.5 md:mt-1">students</span>
                </td>
              );
            })}
          </tr>

          {/* Action Details */}
          <tr className="bg-[#FAFBFD]/30">
            <td className="p-4 md:p-8 sticky left-0 bg-[#FAFBFD]/90 backdrop-blur font-black text-slate-700 z-10 border-r border-gray-100">
              <div>
                <p className="font-bold text-slate-800 text-xs md:text-sm">Action Details</p>
                <p className="text-[8px] md:text-[10px] font-medium text-gray-400 mt-0.5">Deep-dive studies, reviews</p>
              </div>
            </td>
            {comparedColleges.map((college) => (
              <td key={college.id} className="p-4 md:p-8 text-center bg-slate-50/20">
                <div className="flex flex-col gap-1.5 max-w-[120px] md:max-w-[160px] mx-auto">
                  <Button
                    type="primary"
                    onClick={() => onViewDetails(college.id)}
                    className="bg-[#3F51B5] hover:bg-[#303F9F] border-none font-bold rounded-lg md:rounded-xl h-9 md:h-11 shadow-sm w-full text-xs md:text-sm"
                  >
                    View Details
                  </Button>
                  {college.schoolUrl ? (
                    <a
                      href={college.schoolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-[11px] font-bold transition text-center flex items-center justify-center w-full"
                    >
                      Visit Website
                    </a>
                  ) : (
                    <button
                      disabled
                      className="border border-gray-200 text-gray-400 px-4 py-1.5 rounded-full text-[11px] font-bold cursor-not-allowed text-center flex items-center justify-center w-full"
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
