"use client";

import React, { useState } from 'react';
import AboutSection from "./AboutSection";
import StatsGrid from "./StatsGrid";
import ProgramDetail from "./ProgramDetail";
import AdmissionsOverview from "./AdmissionsOverview";
import OutcomesSection from "./OutcomesSection";
import StudentReviews from "./StudentReviews";
import CourseSummarySideCard from "./CourseSummarySideCard";
import ProgramSearchBand from "./ProgramSearchBand";
import ProgramsAcademicsTab from "./ProgramsAcademicsTab";

const tabs = [
  "Overview",
  "Programs & Academics",
  "Admissions",
  "Outcomes & Careers",
  "Tuition & Costs",
  "Campus & Students",
];

export default function TabContent({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap py-5 text-sm font-bold transition-all duration-200 ${
                  activeTab === tab
                    ? "text-[#2563EB]"
                    : "text-[#64748B] hover:text-gray-900"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#EF4444] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 w-full flex flex-col xl:flex-row gap-10">
        <div className="flex-1 w-full min-w-0">
          {activeTab === "Overview" && (
            <div className="space-y-16">
              <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                <AboutSection
                  name={data.name}
                  description={data.description}
                />
                <StatsGrid
                  totalStudents={data.totalStudents}
                  facultyRatio={data.facultyRatio}
                  retentionRate={data.retentionRate}
                  programs={data.programs}
                  fafsaApplications={data.fafsaApplications}
                  completionRate={data.completionRate}
                />
              </div>

              <AdmissionsOverview
                admissionRate={data.admissionRate}
                applicants={data.applicants}
                satReadingWriting={data.satReadingWriting}
                satMath={data.satMath}
                satAverage={data.satAverage}
                salaryYear1={data.salaryYear1}
                salaryYear10={data.salaryYear10}
                netRoi20Yr={data.netRoi20Yr}
                growthRate={data.growthRate}
              />

              <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                <StudentReviews />
              </div>

              <ProgramSearchBand />
            </div>
          )}

          {activeTab === "Programs & Academics" && (
            <ProgramsAcademicsTab data={data} />
          )}

          {activeTab === "Admissions" && (
            <AdmissionsOverview
              admissionRate={data.admissionRate}
              applicants={data.applicants}
              satReadingWriting={data.satReadingWriting}
              satMath={data.satMath}
              satAverage={data.satAverage}
            />
          )}

          {activeTab === "Outcomes & Careers" && (
            <OutcomesSection
              salaryYear1={data.salaryYear1}
              salaryYear10={data.salaryYear10}
              netRoi20Yr={data.netRoi20Yr}
              growthRate={data.growthRate}
              empFactor={data.empFactor}
              debtIncomeRatio={data.debtIncomeRatio}
            />
          )}

          {activeTab === "Campus & Students" && (
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
              <p className="text-slate-500">Campus & Students details are coming soon.</p>
            </div>
          )}

          {activeTab === "Tuition & Costs" && (
            <div className="py-10">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Tuition & Costs</h2>
              <p className="text-gray-600">Information about tuition and costs will be displayed here.</p>
            </div>
          )}
        </div>

        <div className="w-full xl:w-[320px] shrink-0 xl:sticky xl:top-24 self-start">
          <CourseSummarySideCard
            degree={data.degree}
            duration={data.duration}
            format={data.format}
            financialAid={data.financialAid}
          />
        </div>
      </div>
    </>
  );
}
