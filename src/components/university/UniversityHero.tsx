"use client";

import React from 'react';
import { Bookmark, Share2, GitCompareArrows, MapPin } from 'lucide-react';

interface UniversityHeroProps {
  name: string;
  location: string;
  type: string;
  rank: string;
  admissionRate: string;
  tuitionFee: string;
  logoColor: string;
  tuitionData?: any;
  tuitionType?: 'in_state' | 'out_state';
}

export default function UniversityHero({
  name, location, type, rank, admissionRate, tuitionFee, logoColor, tuitionData, tuitionType = 'in_state'
}: UniversityHeroProps) {
  const isStanford = name.toLowerCase().includes("stanford");

  // Fallbacks if database has nulls or if tuitionData is absent
  const tuitionInState = tuitionData?.tuition?.tuition_in_state ?? 12714;
  const tuitionOutState = tuitionData?.tuition?.tuition_out_state ?? 25000;
  const bookSupply = tuitionData?.tuition?.booksupply ?? 1200;
  const roomBoardOnCampus = tuitionData?.housing?.roomboard_oncampus ?? 7348;
  const otherExpenseOnCampus = tuitionData?.expenses?.otherexpense_oncampus ?? 2832;

  const stickerInState = bookSupply + tuitionInState + roomBoardOnCampus + otherExpenseOnCampus;
  const stickerOutState = bookSupply + tuitionOutState + roomBoardOnCampus + otherExpenseOnCampus;

  const activeStickerVal = tuitionType === 'in_state' ? stickerInState : stickerOutState;
  const activeStickerPrice = tuitionData
    ? `$${Math.round(activeStickerVal).toLocaleString()}`
    : tuitionFee;

  return (
    <div className="relative w-full">
      {/* Banner Cover Image */}
      <div className="h-64 md:h-[300px] w-full overflow-hidden relative">
        <img
          src={isStanford ? "/images/stanford_cover.png" : "https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
          alt={`${name} campus`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
      </div>

      {/* University Info Overlay Container */}
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-14 md:-mt-20 relative z-10">
          {/* Logo Card */}
          {isStanford ? (
            <div className="w-28 h-28 md:w-[160px] md:h-[160px] md:mt-12 bg-white border border-gray-100 rounded-[24px] shadow-xl p-3.5 flex items-center justify-center shrink-0">
              <img
                src="/images/stanford_logo.png"
                alt={`${name} logo`}
                className="w-full h-full object-contain rounded-[16px]"
              />
            </div>
          ) : (
            <div className={`w-32 h-32 md:w-40 md:h-40 md:mt-12 rounded-[28px] ${logoColor} border-4 border-white shadow-xl flex flex-col items-center justify-center text-white shrink-0`}>
              <span className="text-4xl md:text-6xl font-bold">{name.charAt(0)}</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">{name.split(' ')[0]}</span>
            </div>
          )}

          {/* Name & Badges */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1 rounded uppercase tracking-wider">
                {type}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                <MapPin size={14} className="text-gray-400" /> {location}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-blue-600 tracking-tight leading-none mb-1">
              {name}
            </h1>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 mt-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rank</p>
              <p className="text-xl font-black text-red-600">{rank}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admission Rate</p>
              <p className="text-xl font-black text-gray-900">{admissionRate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tuition Fee</p>
              <p className="text-xl font-black text-gray-900">{activeStickerPrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 md:mt-0 font-medium">
            <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
              <Bookmark size={16} /> Save
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
              <GitCompareArrows size={16} /> Compare
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

