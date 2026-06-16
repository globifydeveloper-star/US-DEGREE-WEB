'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareHeader from '@/components/compare/CompareHeader';
import ComparisonTable from '@/components/compare/ComparisonTable';
import { College } from '@/types/university/ComparisonTable';
import CollegeDetailsModal from '@/components/compare/CollegeDetailsModal';
import {
  Building2,
  Plus,
} from 'lucide-react';
import {
  Button,
  Modal,
  Select,
  Spin,
} from 'antd';

// How many colleges to preload into the dropdown before the user searches.
const INITIAL_LIST_SIZE = 20;
// Minimum characters before we filter the in-memory list on keyword.
const MIN_SEARCH_CHARS = 4;
// Debounce window for the search (ms).
const SEARCH_DEBOUNCE_MS = 300;

// ---- Types ----
type UniOption = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  schoolType?: string;
};

// Raw row shape from /compare/colleges
interface RawUniversity {
  unitid?: string | number;
  id?: string | number;
  value?: string | number;
  school_name?: string;
  name?: string;
  label?: string;
  city?: string;
  state?: string;
  school_type?: string;
  college_type?: string;
  control?: string;
}

interface ApiSchool {
  school_name?: string;
  name?: string;
  state?: string;
  city?: string;
  control?: string;
  school_url?: string;
}

interface OverviewData {
  school_name?: string;
  school_url?: string;
  school?: ApiSchool;
  admissions?: {
    admission_rate?: number | null;
    sat_rw_min?: number | null;
    sat_math_min?: number | null;
    sat_rw_max?: number | null;
    sat_math_max?: number | null;
  };
  completion?: { completion_rate?: number | null };
  earnings?: { year_10?: number | string | null };
  students?: { size?: number | null };
}

interface TuitionData {
  tuition?: {
    tuition_in_state?: number | string | null;
    tuition_out_state?: number | string | null;
  };
}

interface OutcomesData {
  earnings?: { year_10?: number | string | null };
}

interface CollegeData {
  school_url?: string;
  school_name?: string;
  name?: string;
  city?: string;
  state?: string;
  school_type?: string;
  control?: string;
}

interface StoredDetail {
  id: string;
  name?: string;
  city?: string;
  state?: string;
  schoolType?: string;
  location?: string;
  cipCode?: string;
  schoolUrl?: string;
  logo?: string;
  logoColor?: string;
}

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- comparedIds is DERIVED from the URL (single source of truth) ----
  // No setState-in-effect: the URL drives state, handlers push to the URL.
  const idsParam = searchParams.get('ids');
  const comparedIds = useMemo<string[]>(
    () => (idsParam ? idsParam.split(',').filter(Boolean) : []),
    [idsParam]
  );

  const [comparedColleges, setComparedColleges] = useState<College[]>([]);

  // Selection search data
  const [selectOptions, setSelectOptions] = useState<UniOption[]>([]);
  // Rendered in the "Quick Add" list, so this is state (not a ref).
  const [initialUniversities, setInitialUniversities] = useState<UniOption[]>([]);
  // Cache of EVERY college we have loaded. Used to resolve names/locations.
  const allUniversitiesRef = useRef<Map<string, UniOption>>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [collegeDetailsCache, setCollegeDetailsCache] = useState<Record<string, unknown>>({});
  const hydratedRef = useRef(false);

  // Get API URL
  const apiUrl = "/api/proxy";

  // Helper: normalise one raw API university row into a UniOption and cache it.
  const cacheUniversity = useCallback((uni: RawUniversity): UniOption | null => {
    if (!uni) return null;
    const id = String(uni.unitid ?? uni.id ?? uni.value ?? '');
    if (!id) return null;
    const option: UniOption = {
      id,
      name: uni.school_name ?? uni.name ?? uni.label ?? '',
      city: uni.city ?? '',
      state: uni.state ?? '',
      schoolType: uni.school_type ?? uni.college_type ?? uni.control ?? 'Public',
    };
    const existing = allUniversitiesRef.current.get(id);
    if (!existing || (!existing.name && option.name)) {
      allUniversitiesRef.current.set(id, option);
    }
    return option;
  }, []);

  // 1. Hydrate the URL from localStorage on first mount (one-time).
  //    This effect ONLY touches external systems (router + localStorage) —
  //    it never calls setState, so it can't trigger cascading renders.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (idsParam) {
      // URL is the source of truth — mirror it into localStorage.
      localStorage.setItem(
        'compared_colleges',
        JSON.stringify(idsParam.split(',').filter(Boolean))
      );
      return;
    }

    // No ids in the URL — restore from localStorage by pushing them to the URL.
    const stored = localStorage.getItem('compared_colleges');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          const params = new URLSearchParams();
          params.set('ids', ids.join(','));
          router.replace(`/compare?${params.toString()}`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [idsParam, router]);

  // 2. Preload the initial dropdown list from /compare/colleges (returns up to 50).
  //    We render only the first ~20; searching hits the server for the rest.
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch(`${apiUrl}/compare/colleges`);
        if (res.ok) {
          const data: unknown = await res.json();
          if (Array.isArray(data)) {
            (data as RawUniversity[]).forEach((uni) => cacheUniversity(uni));

            const all = Array.from(allUniversitiesRef.current.values());
            const mapped = all.slice(0, INITIAL_LIST_SIZE);
            setInitialUniversities(mapped);
            setSelectOptions(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial college list:", err);
      }
    };
    fetchUniversities();
  }, [apiUrl, cacheUniversity]);

  // 2b. Debounced SERVER-SIDE search against the full DB via /compare/colleges?search=...
  const handleDropdownSearch = useCallback((searchText: string) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    const trimmed = searchText.trim();

    if (trimmed.length < MIN_SEARCH_CHARS) {
      setSelectOptions(initialUniversities);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiUrl}/compare/colleges?search=${encodeURIComponent(trimmed)}&limit=50`
        );
        if (res.ok) {
          const data: unknown = await res.json();
          if (Array.isArray(data)) {
            const results: UniOption[] = [];
            const seen = new Set<string>();
            for (const uni of data as RawUniversity[]) {
              const opt = cacheUniversity(uni); // cache so name/location resolve later
              if (opt && !seen.has(opt.id)) {
                seen.add(opt.id);
                results.push(opt);
              }
            }
            setSelectOptions(results.length > 0 ? results : initialUniversities);
          }
        }
      } catch (err) {
        console.error("Failed to search colleges:", err);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [apiUrl, initialUniversities, cacheUniversity]);

  // 3. Keep URL query param synchronised with active compared IDs.
  const syncUrlParams = useCallback((ids: string[]) => {
    const params = new URLSearchParams();
    if (ids.length > 0) {
      params.set('ids', ids.join(','));
    }
    router.push(`/compare?${params.toString()}`);
  }, [router]);

  // 4. Fetch details for compared colleges dynamically.
  useEffect(() => {
    let cancelled = false;

    const sanitizeSalary = (val: number | string | null | undefined): number | null => {
      if (val === null || val === undefined) return null;
      const str = String(val).trim();
      if (str === "No Value" || str === "N/A" || str === "" || str.toLowerCase() === "null") {
        return null;
      }
      const num = Number(str.replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? null : num;
    };

    const toNum = (val: number | string | null | undefined): number | null => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const run = async () => {
      if (comparedIds.length === 0) {
        // Updater returns the same reference when already empty → no extra render.
        setComparedColleges((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      setIsDetailsLoading(true);

      let storedDetails: StoredDetail[] = [];
      try {
        const stored = localStorage.getItem('compared_colleges_details');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) storedDetails = parsed as StoredDetail[];
        }
      } catch (e) {
        console.error("Error reading stored details:", e);
      }

      try {
        const fetchPromises = comparedIds.map(async (id) => {
          const matchedStored = storedDetails.find((d) => String(d.id) === String(id));
          const cipCode = matchedStored?.cipCode || "default";

          const [overviewRes, tuitionRes, outcomesRes, collegeRes] = await Promise.all([
            fetch(`${apiUrl}/overview/${id}/${cipCode}`),
            fetch(`${apiUrl}/tuition/${id}`),
            fetch(`${apiUrl}/outcomes/${id}/${cipCode}`),
            fetch(`${apiUrl}/colleges/${id}`)
          ]);

          let overviewData: OverviewData = {};
          let tuitionData: TuitionData = {};
          let outcomesData: OutcomesData = {};
          let collegeData: CollegeData = {};

          if (overviewRes.ok) overviewData = await overviewRes.json();
          if (tuitionRes.ok) tuitionData = await tuitionRes.json();
          if (outcomesRes.ok) outcomesData = await outcomesRes.json();
          if (collegeRes.ok) collegeData = await collegeRes.json();

          const matchedUni =
            allUniversitiesRef.current.get(String(id)) ||
            selectOptions.find((uni) => String(uni.id) === String(id));

          // ---- NAME (priority order, most reliable first) ----
          const name =
            matchedUni?.name ||
            matchedStored?.name ||
            collegeData?.school_name ||
            collegeData?.name ||
            overviewData?.school_name ||
            overviewData?.school?.school_name ||
            overviewData?.school?.name ||
            "Unknown University";

          // ---- TYPE (Public/Private) ----
          const control =
            matchedUni?.schoolType ||
            matchedStored?.schoolType ||
            collegeData?.school_type ||
            collegeData?.control ||
            overviewData?.school?.control ||
            "Public";
          const isPrivate = String(control).toLowerCase().includes("private");

          // ---- LOCATION ----
          const state =
            matchedUni?.state ||
            matchedStored?.state ||
            collegeData?.state ||
            overviewData?.school?.state ||
            "";
          const city =
            matchedUni?.city ||
            matchedStored?.city ||
            collegeData?.city ||
            overviewData?.school?.city ||
            "";

          const rawUrl =
            collegeData?.school_url ||
            overviewData?.school?.school_url ||
            overviewData?.school_url ||
            "";
          let website = "";
          if (rawUrl && String(rawUrl).trim()) {
            const trimmedUrl = String(rawUrl).trim();
            website = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`;
          }

          let logo = "";
          if (website) {
            try {
              logo = `https://logo.clearbit.com/${new URL(website).hostname}`;
            } catch {
              logo = "";
            }
          }

          const tuitionInState = toNum(tuitionData?.tuition?.tuition_in_state);
          const tuitionOutOfState = toNum(tuitionData?.tuition?.tuition_out_state);
          const acceptanceRate = toNum(overviewData?.admissions?.admission_rate);

          const satRwMin = toNum(overviewData?.admissions?.sat_rw_min);
          const satMathMin = toNum(overviewData?.admissions?.sat_math_min);
          const satMin = satRwMin !== null && satMathMin !== null ? satRwMin + satMathMin : null;

          const satRwMax = toNum(overviewData?.admissions?.sat_rw_max);
          const satMathMax = toNum(overviewData?.admissions?.sat_math_max);
          const satMax = satRwMax !== null && satMathMax !== null ? satRwMax + satMathMax : null;

          const completionRate = toNum(overviewData?.completion?.completion_rate);
          const graduationRate = completionRate !== null ? completionRate / 100 : null;

          const medianSalary =
            sanitizeSalary(outcomesData?.earnings?.year_10) ??
            sanitizeSalary(overviewData?.earnings?.year_10) ??
            null;

          const studentPopulation = toNum(overviewData?.students?.size);

          cacheUniversity({ unitid: id, school_name: name, city, state, school_type: control });

          return {
            id,
            name,
            shortName: name.replace("University", "").replace("Institute of Technology", "").trim(),
            logo,
            state,
            location: city && state ? `${city}, ${state}` : (city || state || "Unknown"),
            isPrivate,
            tuitionInState,
            tuitionOutOfState,
            acceptanceRate,
            satMin,
            satMax,
            graduationRate,
            medianSalary,
            studentPopulation,
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
            website,
            schoolUrl: website || undefined,
            cipCode
          } as College;
        });

        const resolvedColleges = await Promise.all(fetchPromises);
        if (cancelled) return;

        const filteredColleges = resolvedColleges.filter(Boolean) as College[];
        setComparedColleges(filteredColleges);

        const detailsList: StoredDetail[] = filteredColleges.map((c) => ({
          id: String(c.id),
          name: c.name,
          logo: c.logo,
          logoColor: 'bg-blue-600',
          location: c.location,
          city: c.location && c.location.includes(',') ? c.location.split(',')[0].trim() : '',
          state: c.state,
          schoolType: c.isPrivate ? 'Private' : 'Public',
          cipCode: c.cipCode || 'default',
          schoolUrl: c.schoolUrl || ''
        }));
        localStorage.setItem('compared_colleges_details', JSON.stringify(detailsList));
      } catch (err) {
        console.error("Failed to load colleges details:", err);
      } finally {
        if (!cancelled) setIsDetailsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparedIds, apiUrl]);

  // Comparison metrics for highlighting winners.
  const highlights = useMemo(() => {
    const defaultVal = {
      lowestTuitionId: '',
      highestGraduationId: '',
      highestSalaryId: '',
      bestValueId: '',
    };

    if (comparedColleges.length <= 1) return defaultVal;

    const values = {
      lowestTuition: Infinity,
      lowestTuitionId: '',
      highestGraduation: -Infinity,
      highestGraduationId: '',
      highestSalary: -Infinity,
      highestSalaryId: '',
      bestValue: -Infinity,
      bestValueId: '',
    };

    const tuitionValues: number[] = [];
    const graduationValues: number[] = [];
    const salaryValues: number[] = [];
    const valueRatioValues: number[] = [];

    comparedColleges.forEach((c) => {
      const tuition = c.tuitionOutOfState;
      if (tuition !== null) {
        tuitionValues.push(tuition);
        if (tuition < values.lowestTuition) {
          values.lowestTuition = tuition;
          values.lowestTuitionId = c.id;
        }
      }

      if (c.graduationRate !== null) {
        graduationValues.push(c.graduationRate);
        if (c.graduationRate > values.highestGraduation) {
          values.highestGraduation = c.graduationRate;
          values.highestGraduationId = c.id;
        }
      }

      if (c.medianSalary !== null) {
        salaryValues.push(c.medianSalary);
        if (c.medianSalary > values.highestSalary) {
          values.highestSalary = c.medianSalary;
          values.highestSalaryId = c.id;
        }
      }

      if (c.medianSalary !== null && tuition !== null) {
        const valueRatio = c.medianSalary / (tuition || 1);
        valueRatioValues.push(valueRatio);
        if (valueRatio > values.bestValue) {
          values.bestValue = valueRatio;
          values.bestValueId = c.id;
        }
      }
    });

    const hasTuitionDiff = tuitionValues.length > 1 && Math.max(...tuitionValues) !== Math.min(...tuitionValues);
    const hasGradDiff = graduationValues.length > 1 && Math.max(...graduationValues) !== Math.min(...graduationValues);
    const hasSalaryDiff = salaryValues.length > 1 && Math.max(...salaryValues) !== Math.min(...salaryValues);
    const hasValueRatioDiff = valueRatioValues.length > 1 && Math.max(...valueRatioValues) !== Math.min(...valueRatioValues);

    return {
      lowestTuitionId: hasTuitionDiff ? values.lowestTuitionId : '',
      highestGraduationId: hasGradDiff ? values.highestGraduationId : '',
      highestSalaryId: hasSalaryDiff ? values.highestSalaryId : '',
      bestValueId: hasValueRatioDiff ? values.bestValueId : '',
    };
  }, [comparedColleges]);

  // Averages for lower/higher calculations.
  const averages = useMemo(() => {
    if (comparedColleges.length === 0)
      return { tuition: 0, graduationRate: 0, medianSalary: 0 };

    const tuitionColleges = comparedColleges.filter((c) => c.tuitionOutOfState !== null);
    const gradColleges = comparedColleges.filter((c) => c.graduationRate !== null);
    const salaryColleges = comparedColleges.filter((c) => c.medianSalary !== null);

    const sumTuition = tuitionColleges.reduce((s, c) => s + (c.tuitionOutOfState ?? 0), 0);
    const sumGraduation = gradColleges.reduce((s, c) => s + (c.graduationRate ?? 0), 0);
    const sumSalary = salaryColleges.reduce((s, c) => s + (c.medianSalary ?? 0), 0);

    return {
      tuition: tuitionColleges.length > 0 ? sumTuition / tuitionColleges.length : 0,
      graduationRate: gradColleges.length > 0 ? sumGraduation / gradColleges.length : 0,
      medianSalary: salaryColleges.length > 0 ? sumSalary / salaryColleges.length : 0,
    };
  }, [comparedColleges]);

  const handleAddCollege = (id: string) => {
    if (comparedIds.includes(id)) return;
    if (comparedIds.length >= 5) {
      setIsLimitModalOpen(true);
      return;
    }

    // Persist what we already know about this college (from the dropdown option)
    // so its name/location/type render immediately — even before the detail APIs
    // respond and on a future reload. This is the core fix for "Unknown" cards.
    const opt =
      allUniversitiesRef.current.get(String(id)) ||
      selectOptions.find((u) => u.id === id) ||
      initialUniversities.find((u) => u.id === id);
    if (opt) {
      try {
        const stored = localStorage.getItem('compared_colleges_details');
        const list: StoredDetail[] = stored ? JSON.parse(stored) : [];
        if (Array.isArray(list) && !list.some((d) => String(d.id) === String(id))) {
          list.push({
            id: String(id),
            name: opt.name,
            city: opt.city || '',
            state: opt.state || '',
            schoolType: opt.schoolType || 'Public',
            location: opt.city && opt.state ? `${opt.city}, ${opt.state}` : (opt.city || opt.state || ''),
            cipCode: 'default',
          });
          localStorage.setItem('compared_colleges_details', JSON.stringify(list));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const updatedIds = [...comparedIds, id];
    localStorage.setItem('compared_colleges', JSON.stringify(updatedIds));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updatedIds); // URL update re-derives comparedIds
  };

  const handleRemoveCollege = (id: string) => {
    const updatedIds = comparedIds.filter((cid) => cid !== id);
    localStorage.setItem('compared_colleges', JSON.stringify(updatedIds));

    const details = localStorage.getItem('compared_colleges_details');
    if (details) {
      try {
        const detailsList = JSON.parse(details);
        if (Array.isArray(detailsList)) {
          const updatedDetails = detailsList.filter((c: StoredDetail) => String(c.id) !== String(id));
          localStorage.setItem('compared_colleges_details', JSON.stringify(updatedDetails));
        }
      } catch (e) {
        console.error(e);
      }
    }

    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updatedIds);
  };

  const handleClearAll = () => {
    localStorage.setItem('compared_colleges', JSON.stringify([]));
    localStorage.setItem('compared_colleges_details', JSON.stringify([]));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams([]);
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. Header */}
        <CompareHeader />

        {/* 2. Selection search bar */}
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
                {comparedColleges.length} of 5 colleges selected
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
              onSearch={handleDropdownSearch}
              loading={isSearching}
              notFoundContent={
                isSearching
                  ? <Spin size="small" />
                  : <span className="text-gray-400 text-xs">Type at least {MIN_SEARCH_CHARS} characters to search</span>
              }
              onChange={(value) => {
                if (value) handleAddCollege(value);
              }}
              options={selectOptions.map((c) => ({
                value: c.id,
                label: c.city && c.state ? `${c.name} (${c.city}, ${c.state})` : c.name,
                disabled: comparedIds.includes(c.id),
              }))}
            />
            {comparedColleges.length > 0 && (
              <Button
                type="text"
                danger
                className="font-bold flex items-center gap-1.5"
                onClick={handleClearAll}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* 3. Main canvas (Loading spinner, Comparison table, or Empty state) */}
        {isDetailsLoading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Spin size="large" />
              <p className="text-gray-400 font-semibold text-sm">Retrieving institutional datasets...</p>
            </div>
          </div>
        ) : comparedColleges.length === 0 ? (
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
                    onClick={() => handleAddCollege(c.id)}
                    className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#3F51B5] hover:bg-white text-sm font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    {c.name}
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ComparisonTable
            comparedColleges={comparedColleges}
            averages={averages}
            highlights={highlights}
            onRemove={handleRemoveCollege}
            onViewDetails={(id) => setActiveModalId(id)}
          />
        )}

        <CollegeDetailsModal
          collegeId={activeModalId}
          isOpen={activeModalId !== null}
          onClose={() => setActiveModalId(null)}
          cache={collegeDetailsCache}
          setCache={setCollegeDetailsCache}
          comparedColleges={comparedColleges}
        />

        {/* 5. Limit reached warnings modal */}
        <Modal
          title="Comparison Limit Reached"
          open={isLimitModalOpen}
          onCancel={() => setIsLimitModalOpen(false)}
          onOk={() => setIsLimitModalOpen(false)}
          okText="Got it"
          cancelButtonProps={{ style: { display: 'none' } }}
          centered
          className="font-sans"
        >
          <p className="text-gray-600">
            You can compare a maximum of 5 colleges simultaneously to ensure complete readability.
          </p>
        </Modal>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex justify-center items-center py-24">
          <Spin size="large" />
        </div>
      }>
        <CompareContent />
      </Suspense>
      <Footer />
    </main>
  );
}