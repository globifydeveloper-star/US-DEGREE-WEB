'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareHeader from '@/components/compare/CompareHeader';
import ComparisonTable, { College } from '@/components/compare/ComparisonTable';
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

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected college IDs to compare
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [comparedColleges, setComparedColleges] = useState<College[]>([]);
  
  // Selection search data
  const [allUniversities, setAllUniversities] = useState<{ id: string; name: string; city?: string; state?: string; schoolType?: string }[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Get API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // 1. Parse initial IDs from search parameters OR localStorage
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      setComparedIds(ids);
      localStorage.setItem('compared_colleges', JSON.stringify(ids));
    } else {
      const stored = localStorage.getItem('compared_colleges');
      if (stored) {
        try {
          const ids = JSON.parse(stored);
          if (Array.isArray(ids) && ids.length > 0) {
            setComparedIds(ids);
            // Sync to URL
            const params = new URLSearchParams();
            params.set('ids', ids.join(','));
            router.replace(`/compare?${params.toString()}`);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setComparedIds([]);
    }
  }, [searchParams, router]);

  // 2. Fetch search database to populate the select component options
  useEffect(() => {
    const fetchAllUniversitiesForSelect = async () => {
      try {
        const res = await fetch(`${apiUrl}/search?type=universities`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAllUniversities(
              data.map((uni: any) => ({
                id: String(uni.unitid),
                name: uni.school_name,
                city: uni.city,
                state: uni.state,
                schoolType: uni.school_type || uni.college_type || "Public",
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
    if (comparedIds.length === 0) {
      setComparedColleges([]);
      return;
    }

    const fetchCollegesDetails = async () => {
      setIsDetailsLoading(true);
      try {
        const fetchPromises = comparedIds.map(async (id) => {
          // Fetch overview details, tuition fees and career outcomes
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

          // Resolve school basic info from allUniversities
          const matchedUni = allUniversities.find(uni => String(uni.id) === String(id));

          const name = matchedUni?.name || overviewData?.school_name || overviewData?.school?.school_name || overviewData?.school?.name || "Unknown University";
          const control = matchedUni?.schoolType || overviewData?.school?.control || "Public";
          const isPrivate = control.toLowerCase().includes("private");
          const state = matchedUni?.state || overviewData?.school?.state || "US";
          const city = matchedUni?.city || overviewData?.school?.city || "";
          
          let website = "https://www.google.com";
          if (overviewData?.school?.school_url) {
            const url = overviewData.school.school_url;
            website = url.startsWith("http") ? url : `https://${url}`;
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

          // Graduation rate
          const graduationRate = overviewData?.completion?.completion_rate !== null && overviewData?.completion?.completion_rate !== undefined
            ? Number(overviewData.completion.completion_rate) / 100
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
            id,
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
  }, [comparedIds, apiUrl, allUniversities]);

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

    // Keep track of all valid values to check for differences
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

    // Verify differences: if max === min, there is no difference, so don't highlight
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

  // Averages for lower/higher calculations
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

  const handleAddCollege = (id: string) => {
    if (comparedIds.includes(id)) return;
    if (comparedIds.length >= 5) {
      setIsLimitModalOpen(true);
      return;
    }
    const updatedIds = [...comparedIds, id];
    setComparedIds(updatedIds);
    localStorage.setItem('compared_colleges', JSON.stringify(updatedIds));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updatedIds);
  };

  const handleRemoveCollege = (id: string) => {
    const updatedIds = comparedIds.filter((cid) => cid !== id);
    setComparedIds(updatedIds);
    localStorage.setItem('compared_colleges', JSON.stringify(updatedIds));
    window.dispatchEvent(new Event('compared-colleges-updated'));
    syncUrlParams(updatedIds);
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
              placeholder="Search or Select a College..."
              value={null}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                if (value) handleAddCollege(value);
              }}
              options={allUniversities.map((c) => ({
                value: c.id,
                label: c.name,
                disabled: comparedIds.includes(c.id),
              }))}
            />
            {comparedColleges.length > 0 && (
              <Button
                type="text"
                danger
                className="font-bold flex items-center gap-1.5"
                onClick={() => {
                  setComparedIds([]);
                  localStorage.setItem('compared_colleges', JSON.stringify([]));
                  window.dispatchEvent(new Event('compared-colleges-updated'));
                  syncUrlParams([]);
                }}
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
                {allUniversities.slice(0, 4).map((c) => (
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
            onViewDetails={(id) => router.push(`/university/${id}`)}
          />
        )}

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
