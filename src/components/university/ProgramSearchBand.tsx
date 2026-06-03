"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ArrowRight } from "lucide-react";

const programs = [
  { name: "Aeronautics and Astronautics", school: "School of Engineering", level: "Graduate" },
  { name: "Comparative Literature", school: "School of Humanities & Sciences", level: "Undergrad/Grad" },
  { name: "Computational Mathematics", school: "School of Humanities & Sciences", level: "Undergrad" },
  { name: "Energy Resources Engineering", school: "School of Earth & Sustainability", level: "Graduate" },
];

interface ProgramSearchBandProps {
  collegeName?: string;
}

export default function ProgramSearchBand({ collegeName = "Stanford" }: ProgramSearchBandProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("all");
  const [fieldOfStudy, setFieldOfStudy] = useState("all");

  const filteredPrograms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return programs.filter((program) => {
      const matchesSearch =
        query.length === 0 ||
        program.name.toLowerCase().includes(query) ||
        program.school.toLowerCase().includes(query);
      const matchesDegree =
        degreeLevel === "all" ||
        program.level.toLowerCase().includes(degreeLevel);

      let matchesField = true;
      if (fieldOfStudy !== "all") {
        if (fieldOfStudy === "engineering") {
          matchesField = program.school.toLowerCase().includes("engineering");
        } else if (fieldOfStudy === "humanities") {
          matchesField = program.school.toLowerCase().includes("humanities");
        } else if (fieldOfStudy === "earth") {
          matchesField = program.school.toLowerCase().includes("earth") || program.school.toLowerCase().includes("sustainability");
        }
      }

      return matchesSearch && matchesDegree && matchesField;
    });
  }, [degreeLevel, searchQuery, fieldOfStudy]);

  return (
    <section className="w-full bg-[#EAF6FF] py-16">
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-[26px] font-black text-slate-900 tracking-tight">Search All Programs</h2>
            <p className="mt-2 text-xs md:text-sm font-semibold text-slate-500 max-w-xl mx-auto">
              Explore the complete catalog of {collegeName}s academic offerings across seven schools.
            </p>
          </div>

          <div className="mx-auto mb-8 grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
            {/* Search Input */}
            <label className="flex h-12 items-center gap-2.5 rounded-xl border border-blue-100 bg-white px-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all cursor-text">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by keyword (e.g. Physics, Data Science...)"
                className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            {/* Degree Level Select */}
            <div className="relative">
              <select
                value={degreeLevel}
                onChange={(event) => setDegreeLevel(event.target.value)}
                className="w-full h-12 appearance-none rounded-xl border border-blue-100 bg-white pl-4 pr-10 text-xs font-bold text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer transition-all"
              >
                <option value="all">Degree Level</option>
                <option value="undergrad">Undergraduate</option>
                <option value="graduate">Graduate</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Field of Study Select */}
            <div className="relative">
              <select
                value={fieldOfStudy}
                onChange={(event) => setFieldOfStudy(event.target.value)}
                className="w-full h-12 appearance-none rounded-xl border border-blue-100 bg-white pl-4 pr-10 text-xs font-bold text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 cursor-pointer transition-all"
              >
                <option value="all">Field of Study</option>
                <option value="engineering">Engineering</option>
                <option value="humanities">Humanities & Sciences</option>
                <option value="earth">Earth Sciences</option>
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Find Button */}
            <button className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] duration-200">
              Find
            </button>
          </div>

          {/* Program Cards Grid */}
          <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredPrograms.map((program) => (
              <button
                key={program.name}
                className="group flex min-h-[72px] items-center justify-between rounded-xl bg-white p-5 text-left border border-blue-50/50 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] hover:border-blue-100 hover:scale-[1.01]"
              >
                <span className="pr-4">
                  <span className="block text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {program.name}
                  </span>
                  <span className="mt-1 block text-[10px] font-semibold text-slate-400">
                    {program.school} • {program.level}
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
