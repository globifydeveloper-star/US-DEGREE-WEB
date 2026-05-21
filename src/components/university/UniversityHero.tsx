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
}

export default function UniversityHero({
  name, location, type, rank, admissionRate, tuitionFee, logoColor
}: UniversityHeroProps) {
  const isStanford = name.toLowerCase().includes("stanford");

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
      <div className="w-full max-w-[1024px] mx-auto px-6 sm:px-10 lg:px-[86px] relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-14 md:-mt-20 relative z-10">
          {/* Logo Card */}
          {isStanford ? (
            <div className="w-28 h-28 md:w-[150px] md:h-[150px] bg-white border border-gray-100 rounded-[24px] shadow-xl p-3.5 flex items-center justify-center shrink-0">
              <img
                src="/images/stanford_logo.png"
                alt={`${name} logo`}
                className="w-full h-full object-contain rounded-[16px]"
              />
            </div>
          ) : (
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl ${logoColor} border-4 border-white shadow-xl flex flex-col items-center justify-center text-white shrink-0`}>
              <span className="text-4xl font-bold">{name.charAt(0)}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{name.split(' ')[0]}</span>
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
              <p className="text-xl font-black text-gray-900">{tuitionFee}</p>
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

