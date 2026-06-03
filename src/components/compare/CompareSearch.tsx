'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Select, Spin, message } from 'antd';
import { ComparedCollege } from '@/types/compare';
import { Search } from 'lucide-react';
import { ApiCollege } from '@/types/compare-search';
interface CompareSearchProps {
  selectedColleges: ComparedCollege[];
  onAddCollege: (college: ComparedCollege) => void;
  onRemoveCollege: (id: number) => void;
}

type LabeledValue = { value: number; label: string };

export default function CompareSearch({
  selectedColleges,
  onAddCollege,
  onRemoveCollege,
}: CompareSearchProps) {
  // Options fetched from API (dropdown suggestions)
  const [fetchedOptions, setFetchedOptions] = useState<{ value: number; label: string; college: ComparedCollege }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Load default colleges on focus using the search endpoint with a broad term
  const loadDefaultSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/colleges/search?query=university&limit=20`);
      if (res.ok) {
        const data: ApiCollege[] = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((uni) => ({
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
          setFetchedOptions(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load default suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Perform search query against API
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadDefaultSuggestions();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/colleges/search?query=${encodeURIComponent(query)}&limit=30`);
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
          setFetchedOptions(formatted);
        } else {
          setFetchedOptions([]);
        }
      } else {
        setFetchedOptions([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setFetchedOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, loadDefaultSuggestions]);

  // Debounced search - triggers API call when user types
  const handleSearch = useCallback((val: string) => {
    setSearchText(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  }, [performSearch]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Build merged options: fetched API results + already-selected colleges (so their labels show correctly)
  const mergedOptions = useMemo(() => {
    const optionsMap = new Map<number, { value: number; label: string; college: ComparedCollege }>();

    // Add selected colleges first so they always have labels
    selectedColleges.forEach((c) => {
      optionsMap.set(c.unitid, {
        value: c.unitid,
        label: `${c.school_name} (${c.city || ''}, ${c.state || ''})`,
        college: c
      });
    });

    // Add fetched options (overwrite with richer data if same ID)
    fetchedOptions.forEach((opt) => {
      optionsMap.set(opt.value, opt);
    });

    return Array.from(optionsMap.values());
  }, [fetchedOptions, selectedColleges]);

  // The value for labelInValue mode: array of { value, label } for selected colleges
  const selectedLabeledValues: LabeledValue[] = useMemo(() => {
    return selectedColleges.map((c) => ({
      value: c.unitid,
      label: `${c.school_name} (${c.city || ''}, ${c.state || ''})`,
    }));
  }, [selectedColleges]);

  const handleChange = (values: LabeledValue[]) => {
    const newIds = values.map((v) => v.value);
    const currentIds = selectedColleges.map((c) => c.unitid);

    // Find removed ID
    const removedId = currentIds.find((id) => !newIds.includes(id));
    if (removedId !== undefined) {
      onRemoveCollege(removedId);
      return;
    }

    // Find added ID
    const addedId = newIds.find((id) => !currentIds.includes(id));
    if (addedId !== undefined) {
      if (currentIds.length >= 5) {
        message.warning('You can compare a maximum of 5 colleges simultaneously.');
        return;
      }

      const targetOption = mergedOptions.find((opt) => opt.value === addedId);
      if (targetOption) {
        onAddCollege(targetOption.college);
      } else {
        console.warn('Added college not found in options list:', addedId);
      }
    }
  };

  const selectedIds = selectedColleges.map((c) => c.unitid);

  return (
    <div className="w-full">
      <Select
        mode="multiple"
        labelInValue
        maxCount={5}
        maxTagCount={0}
        maxTagPlaceholder={(omittedValues) => (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-0.5 rounded-full">
            {omittedValues.length} college{omittedValues.length !== 1 ? 's' : ''} selected
          </span>
        )}
        showSearch
        value={selectedLabeledValues}
        filterOption={false}
        placeholder="Search colleges to compare..."
        className="w-full compare-search-select"
        onSearch={handleSearch}
        onChange={handleChange}
        onFocus={loadDefaultSuggestions}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : 'No colleges found'}
        suffixIcon={<Search className="w-4 h-4 text-gray-400" />}
        options={mergedOptions.map((opt) => ({
          value: opt.value,
          label: opt.label,
          disabled: !selectedIds.includes(opt.value) && selectedIds.length >= 5
        }))}
        classNames={{ popup: { root: 'compare-search-dropdown' } }}
      />
    </div>
  );
}
