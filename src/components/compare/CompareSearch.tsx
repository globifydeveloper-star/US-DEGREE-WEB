'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, message } from 'antd';
import { ComparedCollege } from '@/types/compare';
import { Search } from 'lucide-react';

interface CompareSearchProps {
  selectedColleges: ComparedCollege[];
  onAddCollege: (college: ComparedCollege) => void;
  onRemoveCollege: (id: number) => void;
}

interface ApiCollege {
  unitid: number;
  school_name: string;
  city: string;
  state: string;
  school_type?: string;
  school_url?: string;
}

export default function CompareSearch({
  selectedColleges,
  onAddCollege,
  onRemoveCollege,
}: CompareSearchProps) {
  const [options, setOptions] = useState<{ value: number; label: string; college: ComparedCollege }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Load default 20 colleges
  const loadDefaultSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/colleges?page=1&limit=20`);
      if (res.ok) {
        const result = await res.json();
        const data = Array.isArray(result) ? result : result.data || [];
        
        if (Array.isArray(data)) {
          const formatted = data.map((uni: ApiCollege) => ({
            value: Number(uni.unitid),
            label: `${uni.school_name} (${uni.city || ''}, ${uni.state || ''})`,
            college: {
              unitid: Number(uni.unitid),
              school_name: uni.school_name,
              city: uni.city || '',
              state: uni.state || '',
              school_type: uni.school_type || 'Public',
              school_url: uni.school_url || ''
            }
          }));
          setOptions(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load default suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Perform search query
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadDefaultSuggestions();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/colleges/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const result = await res.json();
        // Backend could return direct array or wrapped in { data: [...] }
        const data = Array.isArray(result) ? result : result.data || [];
        
        if (Array.isArray(data)) {
          const formatted = data.map((uni: ApiCollege) => ({
            value: Number(uni.unitid),
            label: `${uni.school_name} (${uni.city || ''}, ${uni.state || ''})`,
            college: {
              unitid: Number(uni.unitid),
              school_name: uni.school_name,
              city: uni.city || '',
              state: uni.state || '',
              school_type: uni.school_type || 'Public',
              school_url: uni.school_url || ''
            }
          }));
          setOptions(formatted);
        } else {
          setOptions([]);
        }
      } else {
        setOptions([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, loadDefaultSuggestions]);

  // Debounced search trigger
  useEffect(() => {
    if (!searchText) {
      loadDefaultSuggestions();
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      performSearch(searchText);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, performSearch, loadDefaultSuggestions]);

  const handleChange = (values: number[]) => {
    // Determine additions or removals
    const currentIds = selectedColleges.map((c) => c.unitid);
    
    // Find removed IDs
    const removedId = currentIds.find((id) => !values.includes(id));
    if (removedId !== undefined) {
      onRemoveCollege(removedId);
      return;
    }

    // Find added ID
    const addedId = values.find((id) => !currentIds.includes(id));
    if (addedId !== undefined) {
      if (currentIds.length >= 5) {
        message.warning('You can compare a maximum of 5 colleges simultaneously.');
        return;
      }
      
      const targetOption = options.find((opt) => opt.value === addedId);
      if (targetOption) {
        onAddCollege(targetOption.college);
      } else {
        // If not in current options list, check if we can fetch its minimal info or fallback
        // This is a safety fallback
        console.warn('Added college not found in options list:', addedId);
      }
    }
  };

  const selectedIds = selectedColleges.map((c) => c.unitid);

  return (
    <div className="w-full">
      <Select
        mode="multiple"
        maxCount={5}
        showSearch
        value={selectedIds}
        filterOption={false}
        placeholder="Search colleges to compare..."
        className="w-full h-12 text-slate-800"
        onSearch={(val) => setSearchText(val)}
        onChange={handleChange}
        onFocus={loadDefaultSuggestions}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : 'No colleges found'}
        suffixIcon={<Search className="w-4 h-4 text-gray-400" />}
        options={options.map((opt) => ({
          value: opt.value,
          label: opt.label,
          // Disable option if selected and limit reached for other items
          disabled: !selectedIds.includes(opt.value) && selectedIds.length >= 5
        }))}
        popupClassName="rounded-2xl shadow-xl overflow-hidden border border-gray-150 p-2"
        tagRender={(props) => {
          const { label, onClose } = props;
          return (
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full m-1 max-w-[200px] truncate">
              <span className="truncate">{label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="hover:text-red-500 font-extrabold text-slate-400 text-xs pl-1"
              >
                ×
              </button>
            </span>
          );
        }}
      />
    </div>
  );
}
