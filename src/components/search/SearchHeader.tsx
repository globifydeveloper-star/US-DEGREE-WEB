import React from 'react';
import { ChevronRight, X, LayoutList, LayoutGrid } from 'lucide-react';
import { Select } from 'antd';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type ViewMode = 'list' | 'grid';

const STATE_MAP: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico'
};

const FILTER_KEYS = ['state', 'credential_title', 'title', 'school_type'];

interface SearchHeaderProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export default function SearchHeader({ view, onViewChange }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const title = searchParams.get("title");
  const credentialTitle = searchParams.get("credential_title");
  const stateCode = searchParams.get("state");
  const sort = searchParams.get("sort") || "recommended";
  
  const stateName = stateCode ? (STATE_MAP[stateCode.toUpperCase()] || stateCode) : null;

  const headingPrefix = title || credentialTitle || "Degree";
  const headingSuffix = stateName ? `in ${stateName}` : "";
  const heading = `${headingPrefix} Programs ${headingSuffix}`.trim();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep sort if it's there? Usually clear means everything or just filters.
    // Let's keep sort.
    if (searchParams.has('sort')) {
      params.set('sort', searchParams.get('sort')!);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getActiveFilters = () => {
    const active: { key: string; value: string; display: string }[] = [];
    FILTER_KEYS.forEach(key => {
      const val = searchParams.get(key);
      if (val) {
        let display = val;
        if (key === 'state') display = STATE_MAP[val.toUpperCase()] || val;
        if (key === 'school_type') display = val.charAt(0).toUpperCase() + val.slice(1);
        active.push({ key, value: val, display });
      }
    });
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="w-full mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-xs text-gray-500 mb-4 gap-1">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
        <ChevronRight size={12} />
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/search')}>Degrees</span>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium capitalize">{headingPrefix}</span>
      </div>

      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 mb-1.5 capitalize">
            {heading}
          </h1>
          <p className="text-sm text-gray-600">
            Discover accredited programs tailored to your professional goals.
          </p>
        </div>
        
        {/* View Toggle + Sort */}
        <div className="flex items-center gap-2">
          {/* List / Grid toggle */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => onViewChange('list')}
              title="List view"
              className={`p-1.5 rounded-md transition ${
                view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => onViewChange('grid')}
              title="Tile view"
              className={`p-1.5 rounded-md transition ${
                view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm min-w-[200px]">
            <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">Sort by:</span>
            <Select 
              value={sort}
              variant="borderless"
              className="w-full font-medium text-gray-900"
              onChange={handleSortChange}
              options={[
                { value: 'recommended', label: 'Recommended' },
                { value: 'tuition_low', label: 'Tuition (Low to High)' },
                { value: 'admission_high', label: 'Admission Rate (High)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <div 
            key={filter.key}
            onClick={() => removeFilter(filter.key)}
            className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100 transition"
          >
            {filter.display}
            <X size={12} className="opacity-60" />
          </div>
        ))}
        
        {activeFilters.length > 0 && (
          <button 
            onClick={clearAllFilters}
            className="text-xs font-medium text-gray-500 hover:text-blue-600 ml-2 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
