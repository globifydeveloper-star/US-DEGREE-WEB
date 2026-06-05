"use client";
import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, GitCompareArrows, MapPin, ExternalLink, X } from 'lucide-react';
import { UniversityHeroProps } from '@/types/university/UniversityHero';
import { Button } from 'antd';
import CompareIconAnimation from '../search/CompareIconAnimation';




export default function UniversityHero({
  id, name, location, type, rank, admissionRate, tuitionFee, logoColor, tuitionData, tuitionType = 'in_state', schoolUrl, accreditor
}: UniversityHeroProps) {
  const [isCompared, setIsCompared] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!id) return;
    const list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    setIsCompared(list.includes(String(id)));

    const handleUpdate = () => {
      const updatedList = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
      setIsCompared(updatedList.includes(String(id)));
    };

    window.addEventListener('compared-colleges-updated', handleUpdate);
    return () => window.removeEventListener('compared-colleges-updated', handleUpdate);
  }, [id]);

  const toggleCompare = () => {
    if (!id) return;
    let list = JSON.parse(localStorage.getItem('compared_colleges') || '[]');
    let detailsList = JSON.parse(localStorage.getItem('compared_colleges_details') || '[]');
    const nextState = !isCompared;

    if (nextState) {
      if (list.length >= 5) {
        alert("You can compare a maximum of 5 colleges simultaneously.");
        return;
      }
      if (!list.includes(String(id))) {
        list.push(String(id));
        detailsList.push({
          id: String(id),
          name: name,
          logoColor: logoColor || 'bg-blue-600',
          location: location,
          cipCode: 'default',
          schoolUrl: schoolUrl || ""
        });
      }
    } else {
      list = list.filter((cid: string) => cid !== String(id));
      detailsList = detailsList.filter((c: any) => c.id !== String(id));
    }
    localStorage.setItem('compared_colleges', JSON.stringify(list));
    localStorage.setItem('compared_colleges_details', JSON.stringify(detailsList));
    setIsCompared(nextState);
    window.dispatchEvent(new Event('compared-colleges-updated'));
  };
  const isStanford = name.toLowerCase().includes("stanford");

  const formattedSchoolUrl = schoolUrl
    ? (schoolUrl.trim().startsWith("http://") || schoolUrl.trim().startsWith("https://")
      ? schoolUrl.trim()
      : `https://${schoolUrl.trim()}`)
    : "";

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
          src="/images/2.jpg"
          alt={`${name} campus`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
      </div>

      {/* University Info Overlay Container */}
      <div className="w-full max-w-[2380px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[86px] relative">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 md:-mt-20 relative z-10">
          {/* Logo Card */}
          {isStanford ? (
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 mt-0 md:mt-12 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 md:p-3.5 flex items-center justify-center shrink-0">
              <img
                src="/images/stanford_logo.png"
                alt={`${name} logo`}
                className="w-full h-full object-contain rounded-[16px]"
              />
            </div>
          ) : (
            <div className={`w-32 h-32 md:w-40 md:h-40 md:mt-12 rounded-[28px] ${logoColor} border-4 border-white shadow-xl flex flex-col items-center justify-center text-white shrink-0 overflow-hidden`}>
              <img
                src="/images/Colleges_105154_logo.png"
                alt={`${name} logo`}
                className="w-full h-full object-contain p-2"
              />            </div>
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
            <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-blue-600 tracking-tight leading-tight break-words mb-1">
              {name}
            </h1>
            {accreditor && (
              <p className="text-xs md:text-sm text-slate-500 font-bold mt-1.5 uppercase tracking-wide">
                Accreditor - {accreditor}
              </p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-6 mt-4 border-b border-gray-200 gap-5">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-8 md:gap-12 w-full">
            {/* <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rank</p>
              <p className="text-xl font-black text-red-600">{rank}</p>
            </div> */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admission Rate</p>
              <p className="text-xl font-black text-gray-900">{admissionRate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tuition Fee</p>
              <p className="text-xl font-black text-gray-900">{activeStickerPrice}</p>
            </div>
          </div>

          <div className="w-full md:w-auto mt-4 md:mt-0">
            <div className="flex flex-col sm:flex-row md:flex-nowrap gap-3 font-medium">

              {formattedSchoolUrl && (
                <a
                  href={formattedSchoolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-sm w-full md:w-fit whitespace-nowrap"
                >
                  <ExternalLink size={16} />
                  Visit Website
                </a>
              )}

              <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto md:items-center">
                <button className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-gray-300 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-600 transition w-full md:w-auto">
                  <Bookmark size={16} />
                  Save
                </button>

                <Button
                  type={isCompared ? "primary" : "default"}
                  onClick={toggleCompare}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`!h-10 !px-4 sm:!px-5 !rounded-full !text-xs sm:!text-sm !font-semibold transition-all duration-300 w-full md:w-auto flex items-center justify-center ${isCompared
                      ? '!bg-blue-600 !border-blue-600 !text-white hover:!bg-blue-700 hover:!border-blue-700 shadow-md'
                      : '!text-gray-600 !border-gray-300 hover:!text-blue-600 hover:!border-blue-600'
                    }`}
                  icon={
                    <CompareIconAnimation
                      active={isCompared}
                      hovered={isHovered}
                    />
                  }
                >
                  {isCompared ? "Added" : "Compare"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

