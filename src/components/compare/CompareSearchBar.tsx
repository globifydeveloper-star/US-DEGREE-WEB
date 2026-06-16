import React from 'react';
import { Select, Button, Spin } from 'antd';
import { Building2 } from 'lucide-react';
import { UniOption } from './useCompareColleges';

interface CompareSearchBarProps {
  comparedCount: number;
  isSearching: boolean;
  selectOptions: UniOption[];
  comparedIds: string[];
  minSearchChars: number;
  onSearch: (searchText: string) => void;
  onAdd: (id: string) => void;
  onClearAll: () => void;
}

export default function CompareSearchBar({
  comparedCount,
  isSearching,
  selectOptions,
  comparedIds,
  minSearchChars,
  onSearch,
  onAdd,
  onClearAll,
}: CompareSearchBarProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#3F51B5]">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            Comparing
          </p>
          <p className="font-extrabold text-slate-800 text-lg">
            {comparedCount} of 5 colleges selected
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <span className="text-sm font-black text-slate-500 ml-1">
          Add College:
        </span>
        <Select
          showSearch
          className="w-full md:w-80 h-12"
          placeholder="Type to search colleges..."
          value={null}
          filterOption={false}
          onSearch={onSearch}
          loading={isSearching}
          notFoundContent={
            isSearching ? (
              <Spin size="small" />
            ) : (
              <span className="text-gray-400 text-xs">
                Type at least {minSearchChars} characters to search
              </span>
            )
          }
          onChange={(value) => {
            if (value) onAdd(value);
          }}
          options={selectOptions.map((c) => ({
            value: c.id,
            label: c.city && c.state ? `${c.name} (${c.city}, ${c.state})` : c.name,
            disabled: comparedIds.includes(c.id),
          }))}
        />
        {comparedCount > 0 && (
          <Button
            type="text"
            danger
            className="font-bold flex items-center gap-1.5"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
