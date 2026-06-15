"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, GraduationCap, Search } from "lucide-react";
import { Select } from "antd";

const MOCK_STATES = [
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "MA", label: "Massachusetts" },
  { value: "WA", label: "Washington" },
  { value: "IL", label: "Illinois" },
  { value: "PA", label: "Pennsylvania" },
  { value: "FL", label: "Florida" },
  { value: "NC", label: "North Carolina" },
  { value: "GA", label: "Georgia" }
];

const MOCK_LEVELS = [
  { value: "Associate's Degree", label: "Associate's Degree" },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: "Doctoral Degree", label: "Doctoral Degree" },
  { value: "Post-Baccalaureate Certificate", label: "Post-Baccalaureate Certificate" }
];

const MOCK_COURSES = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Biology / Biological Sciences", label: "Biology / Biological Sciences" },
  { value: "Economics", label: "Economics" },
  { value: "Management Science & Engineering", label: "Management Science & Engineering" },
  { value: "Symbolic Systems", label: "Symbolic Systems" }
];

export default function Hero() {
  const router = useRouter();

  const [levels, setLevels] = useState<{ value: string; label: string }[]>(MOCK_LEVELS);
  const [states, setStates] = useState<{ value: string; label: string }[]>(MOCK_STATES);
  const [courses, setCourses] = useState<{ value: string; label: string }[]>(MOCK_COURSES);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [searchType, setSearchType] = useState<"programs" | "universities">(
    "programs"
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = "/api/proxy";

        const statesRes = await fetch(`${apiUrl}/states`);
        if (statesRes.ok) {
          const data = await statesRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setStates(
              data.map((state: { state_code: string; state_title: string }) => ({
                value: state.state_code,
                label: state.state_title,
              }))
            );
          }
        } else {
          console.error("Failed to fetch states:", await statesRes.text());
        }

        const credsRes = await fetch(`${apiUrl}/credentials`);
        if (credsRes.ok) {
          const data = await credsRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setLevels(
              data.map((credential: { id: number; name: string }) => ({
                value: credential.name,
                label: credential.name,
              }))
            );
          }
        } else {
          console.error("Failed to fetch credentials:", await credsRes.text());
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsCoursesLoading(true);
    setSelectedCourse(null);

    try {
      const queryParams = new URLSearchParams();
      if (selectedLevel) queryParams.append("credential_title", selectedLevel);
      if (selectedState) queryParams.append("state", selectedState);

      const apiUrl = "/api/proxy";
      const res = await fetch(`${apiUrl}/courses?${queryParams.toString()}`);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCourses(
            data.map((item: { title: string }) => ({
              value: item.title,
              label: item.title,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Keep MOCK_COURSES fallback if fetch fails
      setCourses(MOCK_COURSES);
    } finally {
      setIsCoursesLoading(false);
    }
  }, [selectedLevel, selectedState]);

  useEffect(() => {
    if (selectedLevel || selectedState) {
      fetchCourses();
    } else {
      setCourses(MOCK_COURSES);
    }
  }, [selectedLevel, selectedState, fetchCourses]);

  const handleSearch = () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append("type", searchType);

    if (selectedLevel)
      params.append("credential_title", selectedLevel);

    if (selectedState)
      params.append("state", selectedState);

    if (
      searchType === "programs" &&
      selectedCourse
    ) {
      params.append("title", selectedCourse);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#f5f8fc] px-4 sm:px-10 lg:px-[49px] pb-0 pt-[30px] flex justify-center">
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_58%_38%,rgba(186,235,227,0.85)_0%,rgba(186,235,227,0.55)_25%,rgba(186,235,227,0.22)_45%,rgba(255,255,255,0)_72%)]
        "
      />
      <div className="relative w-full max-w-[2380px]">
        {/* Hero Row */}
        <div className="grid gap-14 lg:grid-cols-[0.98fr_1fr] lg:gap-[62px]">
          {/* Left Content */}
          <div className="flex flex-col items-start pt-[10px]">
            <div className="w-full">
              <span className="mb-5 inline-block rounded-full bg-[#ff3b30] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
                TOP-TIER EDUCATION
              </span>

              <h1 className="
                mb-4 lg:mb-6
                max-w-[600px]
                text-[48px]
                sm:text-[64px]
                lg:text-[78px]
                font-bold
                leading-[0.95]
                tracking-[-0.04em]
                text-[#111827]
              ">
                The Neutral Way to
                Choose a
                <span className="text-[#3b5bdb]"> U.S. </span>
                <span> Degrees </span>
              </h1>

              {/* Trust badges */}
              <p className="
                mb-6
                flex flex-wrap items-center
                gap-x-1.5 sm:gap-x-2 gap-y-1
                text-[12px] sm:text-[20px] lg:text-[25px]
                text-[#1f2937]
                tracking-[-0.01em]
              ">
                <span>Family-funded</span>
                <span className="text-[#9ca3af] text-[6px] sm:text-[8px] lg:text-[10px] leading-none select-none" aria-hidden="true">●</span>
                <span>Conflict-free</span>
                <span className="text-[#9ca3af] text-[6px] sm:text-[8px] lg:text-[10px] leading-none select-none" aria-hidden="true">●</span>
                <span>Built on verified data</span>
              </p>

              <p className="
                mb-6 lg:mb-8
                max-w-[650px]
                text-[16px]
                sm:text-[18px]
                leading-[1.3]
                text-[#4b5563]
              ">
                Navigate the complex world of American higher education with ease. Our
                mission is to connect ambitious students with programs that fuel passion and
                guarantee success.
              </p>

              {/* Mobile-only Image (Upside of the search bar on mobile) */}
              <div className="relative mb-6 block lg:hidden w-full">
                <div className="relative z-10 overflow-hidden rounded-[24px] w-full">
                  <img
                    src="/images/collage.webp"
                    alt="Students sitting under a tree"
                    className="h-[220px] sm:h-[300px] w-full object-cover object-center"
                  />
                </div>
              </div>

              {/* Search Card (Mobile/Tablet only) */}
              <div className="w-full rounded-[20px] sm:rounded-[32px] bg-white p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] mb-6 border border-slate-100 lg:hidden">
                {/* Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="flex bg-[#f5f5f5] p-1 rounded-full text-[11px] sm:text-sm">
                    <button
                      onClick={() => setSearchType("programs")}
                      className={`px-2.5 sm:px-6 py-2 rounded-full font-medium transition cursor-pointer ${searchType === "programs"
                        ? "bg-[#2563eb] text-white shadow"
                        : "text-gray-600"
                        }`}
                    >
                      Search Programs
                    </button>

                    <button
                      onClick={() => setSearchType("universities")}
                      className={`px-2.5 sm:px-6 py-2 rounded-full font-medium transition cursor-pointer ${searchType === "universities"
                        ? "bg-[#2563eb] text-white shadow"
                        : "text-gray-600"
                        }`}
                    >
                      Search Universities
                    </button>
                  </div>
                </div>

                <div
                  className={`grid gap-4 ${searchType === "programs"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                    }`}
                >
                  {/* Credential Field */}
                  <div className="flex flex-col">
                    <label className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Credential Level
                    </label>
                    <Select
                      showSearch
                      size="large"
                      placeholder="Select Credential Level"
                      options={levels}
                      value={selectedLevel}
                      onChange={setSelectedLevel}
                      className="w-full"
                    />
                  </div>

                  {/* State field */}
                  <div className="flex flex-col">
                    <label className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      States
                    </label>
                    <Select
                      showSearch
                      size="large"
                      placeholder="Select a State"
                      options={states}
                      value={selectedState}
                      onChange={setSelectedState}
                      className="w-full"
                    />
                  </div>

                  {/* Show course fields only for programs */}
                  {searchType === "programs" && (
                    <div className="flex flex-col">
                      <label className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Course / Field of Study
                      </label>
                      <Select
                        showSearch
                        size="large"
                        placeholder="Select a Course"
                        options={courses}
                        value={selectedCourse}
                        loading={isCoursesLoading}
                        onChange={setSelectedCourse}
                        disabled={!selectedLevel && !selectedState}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Search button */}
                <div className="flex justify-end mt-6 w-full sm:w-auto">
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 sm:px-8 text-white font-semibold hover:bg-[#1d4ed8] text-sm cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                    {isLoading
                      ? "Searching..."
                      : searchType === "programs"
                        ? "Search Degrees"
                        : "Search Universities"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative min-h-[220px] lg:min-h-[320px] hidden lg:block">
            <div className="relative z-10 overflow-hidden rounded-[48px]">
              <img
                src="/images/collage.webp"
                alt="Students sitting under a tree"
                className="h-[220px] w-full object-cover object-center lg:h-[420px]"
              />
            </div>
          </div>
        </div>

        {/* Centered Search Card (Desktop only) */}
        <div className="hidden lg:flex justify-center mt-12">
          <div className="w-full max-w-[1100px] rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            {/* Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-[#f5f5f5] p-1 rounded-full">
                <button
                  onClick={() => setSearchType("programs")}
                  className={`px-6 py-2 rounded-full font-medium transition cursor-pointer ${searchType === "programs"
                    ? "bg-[#2563eb] text-white shadow"
                    : "text-gray-600"
                    }`}
                >
                  Search Programs
                </button>

                <button
                  onClick={() => setSearchType("universities")}
                  className={`px-6 py-2 rounded-full font-medium transition cursor-pointer ${searchType === "universities"
                    ? "bg-[#2563eb] text-white shadow"
                    : "text-gray-600"
                    }`}
                >
                  Search Universities
                </button>
              </div>
            </div>

            <div
              className={`grid gap-5 ${searchType === "programs"
                ? "md:grid-cols-3"
                : "md:grid-cols-2"
                }`}
            >
              {/* Credential Field */}
              <div className="flex flex-col">
                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                  Credential Level
                </label>
                <Select
                  showSearch
                  placeholder="Select Credential Level"
                  options={levels}
                  value={selectedLevel}
                  onChange={setSelectedLevel}
                  className="w-full"
                />
              </div>

              {/* State field */}
              <div className="flex flex-col">
                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                  States
                </label>
                <Select
                  showSearch
                  placeholder="Select a State"
                  options={states}
                  value={selectedState}
                  onChange={setSelectedState}
                  className="w-full"
                />
              </div>

              {/* Show course fields only for programs */}
              {searchType === "programs" && (
                <div className="flex flex-col">
                  <label className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                    Course / Field of Study
                  </label>
                  <Select
                    showSearch
                    placeholder="Select a Course"
                    options={courses}
                    value={selectedCourse}
                    loading={isCoursesLoading}
                    onChange={setSelectedCourse}
                    disabled={!selectedLevel && !selectedState}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Search button */}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-8 text-white font-semibold hover:bg-[#1d4ed8] cursor-pointer"
              >
                <Search className="h-4 w-4" />
                {isLoading
                  ? "Searching..."
                  : searchType === "programs"
                    ? "Search Degrees"
                    : "Search Universities"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
