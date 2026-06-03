'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, BarChart2 } from 'lucide-react';
import { Button } from 'antd';
import { ComparedCollege } from '@/types/compare';

export default function CompareSelectionBar() {
  const router = useRouter();
  const [colleges, setColleges] = useState<ComparedCollege[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateColleges = () => {
      const stored = localStorage.getItem('compared_colleges');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Keep both object compatibility and raw string mapping if migration happens
            const mapped: ComparedCollege[] = parsed.map((item: any) => {
              if (typeof item === 'object' && item !== null) {
                return item as ComparedCollege;
              }
              return {
                unitid: Number(item),
                school_name: `College ID ${item}`,
                city: '',
                state: '',
                school_type: ''
              } as ComparedCollege;
            });
            setColleges(mapped);
            setIsVisible(mapped.length > 0);
            return;
          }
        } catch (e) {
          console.error('Error parsing localStorage compared_colleges:', e);
        }
      }
      setColleges([]);
      setIsVisible(false);
    };

    updateColleges();

    window.addEventListener('compared-colleges-updated', updateColleges);
    return () => {
      window.removeEventListener('compared-colleges-updated', updateColleges);
    };
  }, []);

  const handleRemove = (unitid: number) => {
    const updated = colleges.filter((c) => c.unitid !== unitid);
    localStorage.setItem('compared_colleges', JSON.stringify(updated));
    window.dispatchEvent(new Event('compared-colleges-updated'));
  };

  const handleClearAll = () => {
    localStorage.setItem('compared_colleges', JSON.stringify([]));
    window.dispatchEvent(new Event('compared-colleges-updated'));
  };

  const handleNavigate = () => {
    const ids = colleges.map((c) => c.unitid).join(',');
    router.push(`/compare?ids=${ids}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-transparent flex justify-center pointer-events-none">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-2xl rounded-2xl md:rounded-full px-6 py-4 md:py-3 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto animate-in slide-in-from-bottom duration-300">
        
        {/* Left Side: Count */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Comparison Deck</p>
            <p className="text-sm font-extrabold text-slate-800">
              {colleges.length} of 5 Colleges selected
            </p>
          </div>
        </div>

        {/* Middle: College Chips (Hidden/Scrolled on Mobile) */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 overflow-x-auto max-w-full no-scrollbar px-1 py-1">
          {colleges.map((college) => (
            <div
              key={college.unitid}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-blue-200 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold text-slate-700 transition shrink-0 max-w-[150px] md:max-w-[180px]"
            >
              <span className="truncate">{college.school_name}</span>
              <button
                onClick={() => handleRemove(college.unitid)}
                className="w-4 h-4 rounded-full bg-slate-200/80 hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px] text-slate-500 transition shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="text"
            danger
            className="text-xs font-bold h-9 px-3"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <button
            onClick={handleNavigate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 px-5 rounded-full flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            Go To Compare
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
