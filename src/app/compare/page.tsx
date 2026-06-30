'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CompareHeader from '@/components/compare/CompareHeader';
import ComparisonTable from '@/components/compare/ComparisonTable';
import CollegeDetailsModal from '@/components/compare/CollegeDetailsModal';
import { useCompareColleges } from '@/components/compare/useCompareColleges';
import CompareSearchBar from '@/components/compare/CompareSearchBar';
import EmptyComparisonState from '@/components/compare/EmptyComparisonState';
import { useAuth } from '@/context/AuthContext';
import { Modal, Spin } from 'antd';

function CompareContent() {
  const {
    comparedIds,
    comparedColleges,
    selectOptions,
    initialUniversities,
    isSearching,
    isDetailsLoading,
    isLimitModalOpen,
    setIsLimitModalOpen,
    activeModalId,
    setActiveModalId,
    collegeDetailsCache,
    setCollegeDetailsCache,
    averages,
    highlights,
    handleDropdownSearch,
    handleAddCollege,
    handleRemoveCollege,
    handleClearAll,
    MIN_SEARCH_CHARS,
  } = useCompareColleges();

  return (
    <div className="bg-[#FAFBFD] min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 1. Header */}
        <CompareHeader comparedIds={comparedIds} comparedColleges={comparedColleges} />

        {/* 2. Selection search bar */}
        <CompareSearchBar
          comparedCount={comparedColleges.length}
          isSearching={isSearching}
          selectOptions={selectOptions}
          comparedIds={comparedIds}
          minSearchChars={MIN_SEARCH_CHARS}
          onSearch={handleDropdownSearch}
          onAdd={handleAddCollege}
          onClearAll={handleClearAll}
        />

        {/* 3. Main canvas (Loading spinner, Comparison table, or Empty state) */}
        {isDetailsLoading ? (
          <div className="flex justify-center items-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Spin size="large" />
              <p className="text-gray-400 font-semibold text-sm">Retrieving institutional datasets...</p>
            </div>
          </div>
        ) : comparedColleges.length === 0 ? (
          <EmptyComparisonState
            initialUniversities={initialUniversities}
            onAdd={handleAddCollege}
          />
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

/**
 * Auth gate: compare is logged-in only. We check auth BEFORE mounting
 * CompareContent so the compare data fetches (inside useCompareColleges) never
 * run for an unauthenticated user — redirect to login first, never render-then-401.
 */
function CompareGate() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // No dedicated /login route — send home with a flag that opens the modal.
      router.replace('/?login=1');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return <CompareContent />;
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
        <CompareGate />
      </Suspense>
      <Footer />
    </main>
  );
}