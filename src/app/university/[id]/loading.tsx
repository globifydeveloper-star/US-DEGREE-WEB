"use client";

import React from "react";
import { Skeleton } from "antd";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Skeleton for the university hero section.
 */
function HeroSkeleton() {
  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Logo */}
          <Skeleton.Avatar
            active
            shape="square"
            size={80}
            style={{ borderRadius: 16 }}
          />

          {/* Title & meta */}
          <div className="flex-1">
            <Skeleton.Input
              active
              size="large"
              style={{ width: 320, height: 32, marginBottom: 10 }}
            />
            <div className="flex flex-wrap gap-4 mb-4">
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, height: 14 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 100, height: 14 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 80, height: 14 }}
              />
            </div>
            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton.Button
                  key={i}
                  active
                  size="small"
                  style={{ width: 120, height: 48, borderRadius: 12 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the tab navigation bar.
 */
function TabBarSkeleton() {
  return (
    <div className="sticky top-[50px] z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px]">
        <div className="flex items-center gap-8 py-5">
          {[
            "Overview",
            "Programs",
            "Admissions",
            "Outcomes",
            "Tuition",
            "Campus",
          ].map((tab, index) => (
            <Skeleton.Input
              key={tab}
              active
              size="small"
              style={{ width: 80 + (index % 3) * 20, height: 14 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the main tab content area.
 */
function ContentSkeleton() {
  return (
    <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-10 flex flex-col lg:flex-row gap-10">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* About card */}
        <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
          <Skeleton active paragraph={{ rows: 4 }} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 80, height: 10, marginBottom: 8 }}
                />
                <Skeleton.Input
                  active
                  size="medium"
                  style={{ width: 60, height: 22 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Admissions card */}
        <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
          <Skeleton active paragraph={{ rows: 3 }} />
          <div className="flex flex-wrap gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton.Button
                key={i}
                active
                style={{ width: 140, height: 60, borderRadius: 12 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar card */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton active paragraph={{ rows: 5 }} />
          <Skeleton.Button
            active
            block
            style={{ height: 40, borderRadius: 9999, marginTop: 16 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function UniversityLoading() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <HeroSkeleton />
      <TabBarSkeleton />
      <ContentSkeleton />
      <Footer />
    </main>
  );
}
