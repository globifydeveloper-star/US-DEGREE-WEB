"use client";

import React, { useState } from "react";
import AboutSection from "./AboutSection";
import StatsGrid from "./StatsGrid";
import ProgramDetail from "./ProgramDetail";
import AdmissionsOverview from "./AdmissionsOverview";
import AdmissionsTabContent from "./AdmissionsTabContent";
import OutcomesSection from "./OutcomesSection";
import CourseSummarySideCard from "./CourseSummarySideCard";
import ProgramSearchBand from "./ProgramSearchBand";
import ProgramsAcademicsTab from "./ProgramsAcademicsTab";
import CampusStudentsTab from "./CampusStudentsTab";
import TuitionCostsSection from "./TuitionCostsSection";
import UniversityHero from "./UniversityHero";
import TrustBanner from "./TrustBanner";

const tabs = [
  "Overview",
  "Programs & Academics",
  "Admissions",
  "Outcomes & Careers",
  "Tuition & Costs",
  "Campus & Students",
];

// `data` is a heterogeneous bag assembled in the server page and fanned out to
// many child components, each with its own (and sometimes conflicting) prop
// types. Typing it precisely here would force a large cross-component refactor;
// the page that builds it is the source of truth for each field's shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TabContent({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [tuitionType, setTuitionType] = useState<"in_state" | "out_state">(
    "in_state",
  );

  return (
    <>
      <UniversityHero
        id={data.id}
        name={data.name}
        location={data.location}
        type={data.type}
        rank={data.rank}
        admissionRate={data.admissionRate}
        tuitionFee={data.tuitionFee}
        logoColor={data.logoColor}
        tuitionData={data.tuitionData}
        tuitionType={tuitionType}
        schoolUrl={data.schoolUrl}
        accreditor={data.accreditor}
      />
      <TrustBanner />

      <div className="sticky top-[50px] z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px]">
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

      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-10 w-full flex flex-col lg:flex-row gap-10">
        <div className="flex-1 w-full min-w-0">
          {activeTab === "Overview" && (
            <div className="space-y-10">
              <AboutSection name={data.name} description={data.description} />

              <StatsGrid
                totalStudents={data.totalStudents}
                facultyRatio={data.facultyRatio}
                retentionRate={data.retentionRate}
                programs={data.programs}
                fafsaApplications={data.fafsaApplications}
                completionRate={data.completionRate}
              />

              <ProgramDetail
                degree={data.degree}
                cipCode={data.cipCode}
                description={data.programDescription}
              />

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
            </div>
          )}

          {activeTab === "Programs & Academics" && (
            <ProgramsAcademicsTab data={data} />
          )}

          {activeTab === "Admissions" && (
            <AdmissionsTabContent
              name={data.name}
              admissionRate={data.admissionRate}
              applicants={data.applicants}
              satReadingWriting={data.satReadingWriting}
              satMath={data.satMath}
              satAverage={data.satAverage}
              testingRequirements={data.testingRequirements}
            />
          )}

          {activeTab === "Outcomes & Careers" && (
            <OutcomesSection
              salaryYear1={data.salaryYear1}
              salaryYear5={data.salaryYear5}
              salaryYear10={data.salaryYear10}
              netRoi20Yr={data.netRoi20Yr}
              growthRate={data.growthRate}
              empFactor={data.empFactor}
              debtIncomeRatio={data.debtIncomeRatio}
              loanPrincipal={data.tuitionData?.financial_aid?.loan_principal}
              avgSalary={data.avgSalary}
            />
          )}

          {activeTab === "Campus & Students" && (
            <CampusStudentsTab
              campusData={data.campusData}
              fafsaApplications={data.fafsaApplications}
            />
          )}

          {activeTab === "Tuition & Costs" && (
            <TuitionCostsSection
              tuitionData={data.tuitionData}
              schoolName={data.name}
              tuitionType={tuitionType}
              setTuitionType={setTuitionType}
            />
          )}
        </div>

        <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[120px] self-start">
          <CourseSummarySideCard
            degree={data.degree}
            duration={data.duration}
            format={data.format}
            financialAid={data.financialAid}
            schoolUrl={data.schoolUrl}
          />
        </div>
      </div>

      {(activeTab === "Overview" || activeTab === "Programs & Academics") && (
        <ProgramSearchBand
          universityId={data.id}
          universityName={data.name}
          location={data.location}
          schoolType={data.type}
          admissionRate={data.admissionRate}
          tuitionFee={data.tuitionFee}
          avgSalary={data.avgSalary}
          netRoi20Yr={data.netRoi20Yr}
        />
      )}
    </>
  );
}
