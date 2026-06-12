"use client";

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ResultListSkeleton, SearchHeaderSkeleton, SidebarSkeleton } from '@/components/search/SearchSkeletons';

export default function SearchLoading() {
  return (

    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1">
        {/* Top search bar placeholder */}
        <div className="w-full border-b border-gray-100 bg-gray-50/50 py-3" />

        <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4 flex flex-col md:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden md:block w-56 shrink-0">
            <SidebarSkeleton />
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 w-full min-w-0">
            <SearchHeaderSkeleton />
            <ResultListSkeleton count={5} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
