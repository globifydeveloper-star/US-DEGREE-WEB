"use client";

import React, { useState } from 'react';
import AboutSection from "./AboutSection";
import StatsGrid from "./StatsGrid";
import ProgramDetail from "./ProgramDetail";
import AdmissionsOverview from "./AdmissionsOverview";
import OutcomesSection from "./OutcomesSection";
import StudentReviews from "./StudentReviews";
import CourseSummarySideCard from "./CourseSummarySideCard";

const tabs = [
  "Overview",
  "Programs & Academics",
  "Admissions",
  "Outcomes & Careers",
  "Tuition & Costs",
  "Campus & Students",
];

export default function TabContent({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("Admissions"); // Set to Admissions initially based on request

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 w-full flex flex-col md:flex-row gap-12">
        {/* Left Column - Tab Content */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === "Overview" && (
            <div className="flex flex-col gap-16">
              <section>
                <AboutSection
                  name={data.name}
                  description={data.description}
                  degree={data.degree}
                  duration={data.duration}
                  format={data.format}
                  financialAid={data.financialAid}
                />
                <StatsGrid
                  totalStudents={data.totalStudents}
                  facultyRatio={data.facultyRatio}
                  retentionRate={data.retentionRate}
                  programs={data.programs}
                  fafsaApplications={data.fafsaApplications}
                  completionRate={data.completionRate}
                />
              </section>

              <section>
                <ProgramDetail
                  degree={data.degree || `B.S. in Computer Science`}
                  cipCode={data.cipCode}
                  school={data.school}
                  description={data.programDescription}
                />
              </section>

              <section>
                <AdmissionsOverview
                  admissionRate={data.admissionRate}
                  applicants={data.applicants}
                  satReadingWriting={data.satReadingWriting}
                  satMath={data.satMath}
                  satAverage={data.satAverage}
                />
              </section>

              <section>
                <OutcomesSection
                  salaryYear1={data.salaryYear1}
                  salaryYear10={data.salaryYear10}
                  netRoi20Yr={data.netRoi20Yr}
                  growthRate={data.growthRate}
                  empFactor={data.empFactor}
                  debtIncomeRatio={data.debtIncomeRatio}
                />
              </section>

              <section>
                <StudentReviews />
              </section>
            </div>
          )}

          {activeTab === "Programs & Academics" && (
            <ProgramDetail
              degree={`B.S. in Computer Science`}
              cipCode={data.cipCode}
              school={data.school}
              description={data.programDescription}
            />
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
            <StudentReviews />
          )}

          {activeTab === "Tuition & Costs" && (
            <div className="py-10">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Tuition & Costs</h2>
              <p className="text-gray-600">Information about tuition and costs will be displayed here.</p>
            </div>
          )}
        </div>

        {/* Right Column - Persistent Course Summary */}
        <div className="w-full md:w-80 shrink-0">
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
