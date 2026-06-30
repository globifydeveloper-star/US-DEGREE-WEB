"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const programs = [
  {
    name: "Aeronautics and Astronautics",
    school: "School of Engineering",
    level: "Graduate",
  },
  {
    name: "Comparative Literature",
    school: "School of Humanities & Sciences",
    level: "Undergrad/Grad",
  },
  {
    name: "Computational Mathematics",
    school: "School of Humanities & Sciences",
    level: "Undergrad",
  },
  {
    name: "Energy Resources Engineering",
    school: "School of Earth & Sustainability",
    level: "Graduate",
  },
];

export default function ProgramSearchBand() {
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("all");

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

      return matchesSearch && matchesDegree;
    });
  }, [degreeLevel, searchQuery]);

  return (
    <section className="bg-[#EAF6FF] px-6 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-gray-950">
            Search All Programs
          </h2>
          <p className="mt-2 text-xs font-medium text-gray-500">
            Explore the complete catalog of Stanford academic offerings across
            seven schools.
          </p>
        </div>

        <div className="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-[1.35fr_1fr_1fr_auto]">
          <label className="flex min-h-12 items-center gap-2 rounded-[8px] border border-[#DDE7F0] bg-white px-4 shadow-sm">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by keyword (e.g. Physics, Data Science...)"
              className="w-full bg-transparent text-[11px] font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </label>
          <select
            value={degreeLevel}
            onChange={(event) => setDegreeLevel(event.target.value)}
            className="min-h-12 rounded-[8px] border border-[#DDE7F0] bg-white px-4 text-[11px] font-semibold text-gray-600 shadow-sm outline-none"
          >
            <option value="all">Degree Level</option>
            <option value="undergrad">Undergraduate</option>
            <option value="graduate">Graduate</option>
          </select>
          <select className="min-h-12 rounded-[8px] border border-[#DDE7F0] bg-white px-4 text-[11px] font-semibold text-gray-600 shadow-sm outline-none">
            <option>Field of Study</option>
            <option>Engineering</option>
            <option>Humanities</option>
            <option>Earth Sciences</option>
          </select>
          <button className="min-h-12 rounded-[8px] bg-[#2563EB] px-8 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]">
            Find
          </button>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredPrograms.map((program) => (
            <button
              key={program.name}
              className="group flex min-h-[58px] items-center justify-between rounded-[8px] bg-white px-4 text-left shadow-sm transition hover:shadow-md"
            >
              <span>
                <span className="block text-[11px] font-black leading-tight text-gray-950">
                  {program.name}
                </span>
                <span className="mt-1 block text-[9px] font-semibold text-gray-400">
                  {program.school} / {program.level}
                </span>
              </span>
              <span className="text-sm font-black text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600">
                &gt;
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
