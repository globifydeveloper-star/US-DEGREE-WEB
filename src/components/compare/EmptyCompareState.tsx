'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Search } from 'lucide-react';

interface EmptyCompareStateProps {
  onQuickAdd?: (id: string) => void;
  quickAddOptions?: { id: string; name: string }[];
}

export default function EmptyCompareState({
  onQuickAdd,
  quickAddOptions = []
}: EmptyCompareStateProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-16 text-center max-w-2xl mx-auto my-12 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Building2 className="w-12 h-12" />
      </div>
      
      <h3 className="text-2xl font-black text-slate-900 mb-2">
        No colleges selected for comparison
      </h3>
      
      <p className="text-gray-500 font-semibold mb-8 max-w-md mx-auto leading-relaxed">
        Search and add colleges to begin comparing their admissions, tuition costs, graduation rates, and future salary outcomes side-by-side.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
        <button
          onClick={() => router.push('/search')}
          className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
        >
          <Search className="w-4 h-4" />
          Go To Search
        </button>
      </div>

      {quickAddOptions.length > 0 && onQuickAdd && (
        <div className="border-t border-slate-100 pt-8">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
            Quick Add Recommendations
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {quickAddOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => onQuickAdd(c.id)}
                className="px-4 py-2.5 rounded-full bg-slate-50 border border-slate-150 hover:border-blue-500 hover:bg-white text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
              >
                <span className="truncate max-w-[120px]">{c.name}</span>
                <span className="text-blue-500 font-extrabold text-xs">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
