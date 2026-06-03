'use client';

import React from 'react';
import Image from 'next/image';
import { Tabs, Button } from 'antd';
import { College } from '@/types/compare';
import {
  MapPin,
  ExternalLink,
  DollarSign,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Award,
  BookOpen
} from 'lucide-react';

interface MobileComparisonProps {
  comparedColleges: College[];
  averages: { tuition: number; graduationRate: number; medianSalary: number };
  highlights: { lowestTuitionId: string; highestGraduationId: string; highestSalaryId: string; bestValueId: string };
  onRemove: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export default function MobileComparison({
  comparedColleges,
  averages,
  highlights,
  onRemove,
  onViewDetails,
}: MobileComparisonProps) {
  if (comparedColleges.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden p-4 md:hidden">
      <Tabs
        defaultActiveKey={comparedColleges[0].id}
        type="line"
        animated={{ inkBar: true, tabPane: true }}
        className="mobile-compare-tabs"
        items={comparedColleges.map((college) => {
          const isBestValue = highlights.bestValueId === college.id;
          const isHighSalary = highlights.highestSalaryId === college.id;
          const isLowestCost = highlights.lowestTuitionId === college.id;

          return {
            key: college.id,
            label: (
              <div className="flex flex-col items-center py-1">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {college.logo ? (
                    <Image
                      src={college.logo}
                      alt={college.name}
                      width={24}
                      height={24}
                      className="object-contain max-h-full max-w-full"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="font-bold text-[#3F51B5] text-xs">
                      {college.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold mt-1 text-slate-700 truncate max-w-[65px]">
                  {college.shortName}
                </span>
              </div>
            ),
            children: (
              <div className="pt-4 flex flex-col gap-6 animate-in fade-in duration-300">
                {/* College Hero Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative">
                  <button
                    onClick={() => onRemove(college.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 font-extrabold text-sm"
                  >
                    Remove
                  </button>
                  <h3 className="text-base font-black text-slate-800 pr-12 leading-snug">
                    {college.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {college.location}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                      {college.isPrivate ? 'Private Nonprofit' : 'Public'}
                    </span>
                    {isBestValue && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-[#22C55E] border border-green-100">
                        🏆 Best ROI
                      </span>
                    )}
                    {isHighSalary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                        💰 Salary Leader
                      </span>
                    )}
                    {isLowestCost && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                        📉 Lowest Cost
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Tuition In-State */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Tuition (In-State)</h4>
                      <p className="text-[10px] text-gray-400 font-medium">In-state student baseline</p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {college.tuitionInState !== null ? `$${college.tuitionInState.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>

                  {/* Tuition Out-of-State */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Tuition (Out-of-State)</h4>
                      <p className="text-[10px] text-gray-400 font-medium">National student baseline rate</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-800">
                        {college.tuitionOutOfState !== null ? `$${college.tuitionOutOfState.toLocaleString()}` : 'N/A'}
                      </span>
                      {college.tuitionOutOfState !== null && comparedColleges.length > 1 && (
                        <div className="text-[9px] font-bold mt-0.5">
                          {college.tuitionOutOfState < averages.tuition ? (
                            <span className="text-green-600 flex items-center justify-end">
                              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                              Lower than average
                            </span>
                          ) : college.tuitionOutOfState > averages.tuition ? (
                            <span className="text-amber-600 flex items-center justify-end">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                              Above average
                            </span>
                          ) : (
                            <span className="text-gray-400">Average</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acceptance Rate */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Acceptance Rate</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Selectivity percentage</p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {college.acceptanceRate !== null ? `${(college.acceptanceRate * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>

                  {/* Graduation Rate */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Graduation Rate</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Completed within 6 years</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-800">
                        {college.graduationRate !== null ? `${(college.graduationRate * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                      {college.graduationRate !== null && comparedColleges.length > 1 && (
                        <div className="text-[9px] font-bold mt-0.5">
                          {college.graduationRate > averages.graduationRate ? (
                            <span className="text-green-600 flex items-center justify-end">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                              Higher than average
                            </span>
                          ) : college.graduationRate < averages.graduationRate ? (
                            <span className="text-gray-400 flex items-center justify-end">
                              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                              Lower than average
                            </span>
                          ) : (
                            <span className="text-gray-400">Average</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SAT Scores */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">SAT Score Range</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Middle 50th percentile bounds</p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {college.satMin && college.satMax ? `${college.satMin} – ${college.satMax}` : 'N/A'}
                    </span>
                  </div>

                  {/* Graduate Salary */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Median Graduate Salary</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Outcomes after 10 years</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-800">
                        {college.medianSalary !== null ? `$${college.medianSalary.toLocaleString()}` : 'N/A'}
                      </span>
                      {college.medianSalary !== null && comparedColleges.length > 1 && (
                        <div className="text-[9px] font-bold mt-0.5">
                          {college.medianSalary > averages.medianSalary ? (
                            <span className="text-green-600 flex items-center justify-end">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                              Higher than average
                            </span>
                          ) : college.medianSalary < averages.medianSalary ? (
                            <span className="text-gray-400 flex items-center justify-end">
                              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                              Lower than average
                            </span>
                          ) : (
                            <span className="text-gray-400">Average</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Enrollment */}
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-black text-slate-700">Student Enrollment</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Total enrollment size</p>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {college.studentPopulation !== null ? college.studentPopulation.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    type="primary"
                    onClick={() => onViewDetails(college.id)}
                    className="bg-[#3F51B5] hover:bg-[#303F9F] border-none font-bold rounded-xl h-11 shadow-sm w-full text-sm"
                  >
                    View Full Details
                  </Button>

                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#3F51B5] font-black hover:underline py-2 text-center"
                    >
                      Visit Official Website
                    </a>
                  )}
                </div>
              </div>
            )
          };
        })}
      />
    </div>
  );
}
