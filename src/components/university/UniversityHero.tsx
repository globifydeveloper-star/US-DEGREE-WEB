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
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="h-64 md:h-72 w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt={`${name} campus`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* University Info Overlay */}
      <div className="max-w-7xl mx-auto px-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 relative z-10">
          {/* Logo */}
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl ${logoColor} border-4 border-white shadow-xl flex flex-col items-center justify-center text-white shrink-0`}>
            <span className="text-3xl font-bold">{name.charAt(0)}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">{name.split(' ')[0]}</span>
          </div>

          {/* Name & Badges */}
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                {type}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} /> {location}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600">{name}</h1>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-5 mt-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rank</p>
              <p className="text-lg font-extrabold text-blue-600">{rank}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admission Rate</p>
              <p className="text-lg font-extrabold text-gray-900">{admissionRate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tuition Fee</p>
              <p className="text-lg font-extrabold text-gray-900">{tuitionFee}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-4 md:mt-0">
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
