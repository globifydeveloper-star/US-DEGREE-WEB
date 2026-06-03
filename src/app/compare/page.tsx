'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareHeader from '@/components/compare/CompareHeader';
import ComparisonTable from '@/components/compare/ComparisonTable';
import CompareSearch from '@/components/compare/CompareSearch';
import MobileComparison from '@/components/compare/MobileComparison';
import EmptyCompareState from '@/components/compare/EmptyCompareState';
import { College, ComparedCollege } from '@/types/compare';
import CollegeDetailModal from '@/components/compare/CollegeDetailModal';
import { Building2 } from 'lucide-react';
import { Modal, Spin } from 'antd';

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected college objects from localStorage
  const [comparedCollegesList, setComparedCollegesList] = useState<ComparedCollege[]>([]);
  const [comparedColleges, setComparedColleges] = useState<College[]>([]);
  
  // Quick add recommendations loaded from first 20 colleges
  const [allUniversities, setAllUniversities] = useState<{ id: string; name: string }[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [detailCollege, setDetailCollege] = useState<College | null>(null);

  // Get API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Check mobile viewport width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Sync state when URL params or localStorage changes
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean).map(Number);
      
      const stored = localStorage.getItem('compared_colleges');
      let currentList: ComparedCollege[] = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            currentList = parsed.map((item: any) => {
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
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      // Filter/re-build list to match the URL ids
      const filtered = ids.map(id => {
        const found = currentList.find(c => c.unitid === id);
        return found || {
          unitid: id,
          school_name: `Loading College ${id}...`,
          city: '',
          state: '',
          school_type: ''
        };
      });
      
      setComparedCollegesList(filtered);
      localStorage.setItem('compared_colleges', JSON.stringify(filtered));
    } else {
      const stored = localStorage.getItem('compared_colleges');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const list = parsed.map((item: any) => {
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
            setComparedCollegesList(list);
            
            // Sync to URL
            const params = new URLSearchParams();
            params.set('ids', list.map(c => c.unitid).join(','));
            router.replace(`/compare?${params.toString()}`);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setComparedCollegesList([]);
    }
  }, [searchParams, router]);

  // Sync state if localStorage updates externally (e.g. from floating selection bar)
  useEffect(() => {
    const handleStorageUpdate = () => {
      const stored = localStorage.getItem('compared_colleges');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
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
            setComparedCollegesList(mapped);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('compared-colleges-updated', handleStorageUpdate);
    return () => window.removeEventListener('compared-colleges-updated', handleStorageUpdate);
  }, []);

  // 2. Fetch search database to populate recommendations
  useEffect(() => {
    const fetchAllUniversitiesForSelect = async () => {
      try {
        const res = await fetch(`${apiUrl}/colleges?page=1&limit=20`);
        if (res.ok) {
          const result = await res.json();
          const data = Array.isArray(result) ? result : result.data || [];
          if (Array.isArray(data)) {
            setAllUniversities(
              data.map((uni: any) => ({
                id: String(uni.unitid),
                name: uni.school_name,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch select list:", err);
      }
    };
    fetchAllUniversitiesForSelect();
  }, [apiUrl]);

  // 3. Keep URL query param synchronised with active compared IDs
  const syncUrlParams = (ids: string[]) => {
    const params = new URLSearchParams();
    if (ids.length > 0) {
      params.set('ids', ids.join(','));
    }
    router.push(`/compare?${params.toString()}`);
  };

  // 4. Fetch details for compared colleges dynamically
  useEffect(() => {
    if (comparedCollegesList.length === 0) {
      setComparedColleges([]);
      return;
    }

    const fetchCollegesDetails = async () => {
      setIsDetailsLoading(true);
      try {
        const collegeIds = comparedCollegesList.map(c => c.unitid);
        
        // Call POST /compare
        let comparedMeta: ComparedCollege[] = [...comparedCollegesList];
        try {
          const compareRes = await fetch(`${apiUrl}/compare`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ college_ids: collegeIds }),
          });
          
          if (compareRes.ok) {
            const bodyJson = await compareRes.json();
            const responseData = bodyJson.data || bodyJson;
            if (Array.isArray(responseData)) {
              comparedMeta = responseData.map((item: any) => ({
                unitid: Number(item.unitid),
                school_name: item.school_name || `College ID ${item.unitid}`,
                city: item.city || '',
                state: item.state || '',
                school_type: item.school_type || '',
                school_url: item.school_url || ''
              }));

              // Update comparedCollegesList with real names from API
              // (fixes placeholder names like "Loading College 123...")
              const hasPlaceholders = comparedCollegesList.some(
                c => c.school_name.startsWith('Loading College') || c.school_name.startsWith('College ID')
              );
              if (hasPlaceholders) {
                setComparedCollegesList(comparedMeta);
                localStorage.setItem('compared_colleges', JSON.stringify(comparedMeta));
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch POST /compare:", err);
        }

        // Fetch overview, tuition, outcomes in parallel for each college ID
        const fetchPromises = collegeIds.map(async (id) => {
          const [overviewRes, tuitionRes, outcomesRes] = await Promise.all([
            fetch(`${apiUrl}/overview/${id}/default`),
            fetch(`${apiUrl}/tuition/${id}`),
            fetch(`${apiUrl}/outcomes/${id}/default`)
          ]);

          let overviewData: any = {};
          let tuitionData: any = {};
          let outcomesData: any = {};

          if (overviewRes.ok) overviewData = await overviewRes.json();
          if (tuitionRes.ok) tuitionData = await tuitionRes.json();
          if (outcomesRes.ok) outcomesData = await outcomesRes.json();

          // Resolve school basic info from comparedMeta
          const matchedUni = comparedMeta.find(uni => Number(uni.unitid) === Number(id)) || 
                             comparedCollegesList.find(uni => Number(uni.unitid) === Number(id));

          const name = matchedUni?.school_name || overviewData?.school?.school_name || "Unknown University";
          const control = matchedUni?.school_type || overviewData?.school?.control || "Public";
          const isPrivate = control.toLowerCase().includes("private");
          const state = matchedUni?.state || overviewData?.school?.state || "US";
          const city = matchedUni?.city || overviewData?.school?.city || "";
          
          let website = "https://www.google.com";
          const rawUrl = matchedUni?.school_url || overviewData?.school?.school_url;
          if (rawUrl) {
            website = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
          }

          // Tuition fees
          const tuitionInState = tuitionData?.tuition?.tuition_in_state !== null && tuitionData?.tuition?.tuition_in_state !== undefined
            ? Number(tuitionData.tuition.tuition_in_state)
            : null;
          const tuitionOutOfState = tuitionData?.tuition?.tuition_out_state !== null && tuitionData?.tuition?.tuition_out_state !== undefined
            ? Number(tuitionData.tuition.tuition_out_state)
            : null;

          // Acceptance rates
          const acceptanceRate = overviewData?.admissions?.admission_rate !== null && overviewData?.admissions?.admission_rate !== undefined
            ? Number(overviewData.admissions.admission_rate)
            : null;

          // SAT min and max estimation
          const satMin = overviewData?.admissions?.sat_rw_min !== null && overviewData?.admissions?.sat_math_min !== null && overviewData?.admissions?.sat_rw_min !== undefined && overviewData?.admissions?.sat_math_min !== undefined
            ? Number(overviewData.admissions.sat_rw_min) + Number(overviewData.admissions.sat_math_min)
            : null;
          const satMax = overviewData?.admissions?.sat_rw_max !== null && overviewData?.admissions?.sat_math_max !== null && overviewData?.admissions?.sat_rw_max !== undefined && overviewData?.admissions?.sat_math_max !== undefined
            ? Number(overviewData.admissions.sat_rw_max) + Number(overviewData.admissions.sat_math_max)
            : null;

          // Graduation rate — normalise to 0-1 regardless of whether API returns 94 or 0.94
          const rawCompletion = overviewData?.completion?.completion_rate;
          const graduationRate = rawCompletion != null
            ? (Number(rawCompletion) > 1 ? Number(rawCompletion) / 100 : Number(rawCompletion))
            : null;

          // Median 10yr salary outcomes
          const medianSalary = outcomesData?.earnings?.year_10 !== null && outcomesData?.earnings?.year_10 !== undefined
            ? Number(outcomesData.earnings.year_10)
            : overviewData?.earnings?.year_10 !== null && overviewData?.earnings?.year_10 !== undefined
            ? Number(overviewData.earnings.year_10)
            : null;

          // Student size
          const studentPopulation = overviewData?.students?.size !== null && overviewData?.students?.size !== undefined
            ? Number(overviewData.students.size)
            : null;

          return {
            id: String(id),
            name,
            shortName: name.replace("University", "").replace("Institute of Technology", "").trim(),
            logo: `https://logo.clearbit.com/${new URL(website).hostname}`,
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
            website
          } as College;
        });

        const resolvedColleges = await Promise.all(fetchPromises);
        setComparedColleges(resolvedColleges.filter(Boolean) as College[]);
      } catch (err) {
        console.error("Failed to load colleges details:", err);
      } finally {
        setIsDetailsLoading(false);
      }
    };

    fetchCollegesDetails();
  }, [comparedCollegesList, apiUrl]);

  // Comparison Metrics calculations for highlighting winners
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

  // Averages for calculations
  const averages = useMemo(() => {
    if (comparedColleges.length === 0)
      return { tuition: 0, graduationRate: 0, medianSalary: 0 };

    const tuitionColleges = comparedColleges.filter(c => c.tuitionOutOfState !== null);
    const gradColleges = comparedColleges.filter(c => c.graduationRate !== null);
    const salaryColleges = comparedColleges.filter(c => c.medianSalary !== null);

    const sumTuition = tuitionColleges.reduce((s, c) => s + (c.tuitionOutOfState ?? 0), 0);
    const sumGraduation = gradColleges.reduce((s, c) => s + (c.graduationRate ?? 0), 0);
    const sumSalary = salaryColleges.reduce((s, c) => s + (c.medianSalary ?? 0), 0);

    return {
      tuition: tuitionColleges.length > 0 ? sumTuition / tuitionColleges.length : 0,
      graduationRate: gradColleges.length > 0 ? sumGraduation / gradColleges.length : 0,
      medianSalary: salaryColleges.length > 0 ? sumSalary / salaryColleges.length : 0,
    };
  }, [comparedColleges]);

  const handleAddCollege = (college: ComparedCollege) => {
    if (comparedCollegesList.some((c) => c.unitid === college.unitid)) return;
    if (comparedCollegesList.length >= 5) {
      setIsLimitModalOpen(true);
      return;
    }
    const updated = [...comparedCollegesList, college];
    setComparedCollegesList(updated);
    localStorage.setItem('compared_colleges', JSON.stringify(updated));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updated.map(c => String(c.unitid)));
  };

  const handleRemoveCollege = (id: number) => {
    const updated = comparedCollegesList.filter((c) => c.unitid !== id);
    setComparedCollegesList(updated);
    localStorage.setItem('compared_colleges', JSON.stringify(updated));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updated.map(c => String(c.unitid)));
  };

  const handleQuickAdd = async (id: string) => {
    // Quick Add fetch
    try {
      const res = await fetch(`${apiUrl}/overview/${id}/default`);
      if (res.ok) {
        const details = await res.json();
        const schoolName = details?.school_name || details?.school?.school_name || `College ID ${id}`;
        const newCollege: ComparedCollege = {
          unitid: Number(id),
          school_name: schoolName,
          city: details?.school?.city || '',
          state: details?.school?.state || '',
          school_type: details?.school?.control || 'Public',
          school_url: details?.school?.school_url || ''
        };
        handleAddCollege(newCollege);
      }
    } catch (e) {
      console.error('Failed to quick add college:', e);
    }
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
                {comparedCollegesList.length} of 5 colleges selected
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-black text-slate-500 ml-1">
              Add College:
            </span>
            <div className="w-full md:w-80">
              <CompareSearch
                selectedColleges={comparedCollegesList}
                onAddCollege={handleAddCollege}
                onRemoveCollege={handleRemoveCollege}
              />
            </div>
            {comparedCollegesList.length > 0 && (
              <button
                className="font-bold text-red-500 hover:text-red-700 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  setComparedCollegesList([]);
                  localStorage.setItem('compared_colleges', JSON.stringify([]));
                  window.dispatchEvent(new Event('compared-colleges-updated'));
                  syncUrlParams([]);
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* 3. Main canvas (Loading spinner, Comparison tables, or Empty state) */}
        {isDetailsLoading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Spin size="large" />
              <p className="text-gray-400 font-semibold text-sm">Retrieving institutional datasets...</p>
            </div>
          </div>
        ) : comparedColleges.length === 0 ? (
          <EmptyCompareState
            onQuickAdd={handleQuickAdd}
            quickAddOptions={allUniversities.slice(0, 4)}
          />
        ) : isMobile ? (
          <MobileComparison
            comparedColleges={comparedColleges}
            averages={averages}
            highlights={highlights}
            onRemove={(id) => handleRemoveCollege(Number(id))}
            onViewDetails={(id: string) => {
              const college = comparedColleges.find(c => c.id === id);
              if (college) setDetailCollege(college);
            }}
          />
        ) : (
          <ComparisonTable
            comparedColleges={comparedColleges}
            averages={averages}
            highlights={highlights}
            onRemove={(id) => handleRemoveCollege(Number(id))}
            onViewDetails={(id: string) => {
              const college = comparedColleges.find(c => c.id === id);
              if (college) setDetailCollege(college);
            }}
          />
        )}

        {/* College detail modal */}
        <CollegeDetailModal
          college={detailCollege}
          onClose={() => setDetailCollege(null)}
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

