import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { UniOption } from './useCompareColleges';

interface EmptyComparisonStateProps {
  initialUniversities: UniOption[];
  onAdd: (id: string) => void;
}

export default function EmptyComparisonState({
  initialUniversities,
  onAdd,
}: EmptyComparisonStateProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-16 text-center max-w-2xl mx-auto my-12">
      <div className="w-24 h-24 bg-blue-50 text-[#3F51B5] rounded-full flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-2">
        No colleges selected for comparison
      </h3>
      <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
        Add up to 5 universities from the database search selector to instantly evaluate and discover your best academic and financial match.
      </p>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
          Quick Add Recommendations
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {initialUniversities.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => onAdd(c.id)}
              className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#3F51B5] hover:bg-white text-sm font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              {c.name}
              <Plus className="w-3.5 h-3.5 text-blue-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
