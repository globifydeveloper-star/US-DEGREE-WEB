"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Slider } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SidebarSkeleton } from "./SearchSkeletons";

const MOCK_STATES = [
  { state_code: "CA", state_title: "California" },
  { state_code: "NY", state_title: "New York" },
  { state_code: "TX", state_title: "Texas" },
  { state_code: "MA", state_title: "Massachusetts" },
  { state_code: "WA", state_title: "Washington" },
  { state_code: "IL", state_title: "Illinois" },
  { state_code: "PA", state_title: "Pennsylvania" },
  { state_code: "FL", state_title: "Florida" },
  { state_code: "NC", state_title: "North Carolina" },
  { state_code: "GA", state_title: "Georgia" }
];

const MOCK_CREDENTIALS = [
  { id: 1, name: "Associate's Degree" },
  { id: 2, name: "Bachelor's Degree" },
  { id: 3, name: "Master's Degree" },
  { id: 4, name: "Doctoral Degree" },
  { id: 5, name: "Post-Baccalaureate Certificate" }
];

export default function SearchSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [states, setStates] = useState<{ state_code: string; state_title: string }[]>(MOCK_STATES);
  const [credentials, setCredentials] = useState<{ id: number; name: string }[]>(MOCK_CREDENTIALS);
  const [searchState, setSearchState] = useState("");
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);

  const selectedStates = searchParams.get("state")?.split(",").filter(Boolean) ?? [];
  const selectedCredentials = searchParams.get("credential_title")?.split(",").filter(Boolean) ?? [];
  const selectedCollegeType = searchParams.get("school_type");

  const initialTuitionMin = searchParams.get("tuition_min") ? Number(searchParams.get("tuition_min")) / 2000 : 0;
  const initialTuitionMax = searchParams.get("tuition_max") ? Number(searchParams.get("tuition_max")) / 2000 : 25;
  const [tuitionRange, setTuitionRange] = useState<[number, number]>([initialTuitionMin, initialTuitionMax]);

  // Count active filters for the badge
  const activeFilterCount = (selectedStates.length > 0 ? 1 : 0)
    + (selectedCredentials.length > 0 ? 1 : 0)
    + (selectedCollegeType ? 1 : 0)
    + (tuitionRange[0] !== 0 || tuitionRange[1] !== 25 ? 1 : 0);

  const handleTuitionChange = (val: number | number[]) => {
    if (Array.isArray(val)) setTuitionRange([val[0], val[1]]);
  };

  const handleTuitionAfterChange = (val: number | number[]) => {
    if (Array.isArray(val)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tuition_min", (val[0] * 2000).toString());
      params.set("tuition_max", (val[1] * 2000).toString());
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiUrl = "/api/proxy";

        // Fetch States
        const statesRes = await fetch(`${apiUrl}/states`);
        if (statesRes.ok) {
          const data = await statesRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setStates(data);
          }
        }

        // Fetch Credentials
        const credsRes = await fetch(`${apiUrl}/credentials`);
        if (credsRes.ok) {
          const data = await credsRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setCredentials(data);
          }
        }
      } catch (error) {
        console.error("Error fetching sidebar options:", error);
      } finally {
        setIsFiltersLoading(false);
      }
    };
    fetchOptions();
  }, []);

  /** Toggle a single value on/off for a single-select param (e.g. school_type) */
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  /** Toggle a value in a comma-separated multi-select param (e.g. state, credential_title) */
  const handleMultiFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    if (current.length > 0) {
      params.set(key, current.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredStates = states.filter(s =>
    s.state_title.toLowerCase().includes(searchState.toLowerCase()) ||
    s.state_code.toLowerCase().includes(searchState.toLowerCase())
  );

  /* ── Shared filter content (used in both mobile drawer & desktop sidebar) ── */
  const filterContent = isFiltersLoading ? (
    <SidebarSkeleton />
  ) : (
    <>
      {/* Degree & Credentials */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
          Degree Level
        </h3>

        <div className="h-[160px] overflow-y-auto pr-1 degree-scrollbar">
          <div className="flex flex-col gap-3">
            {credentials.map((cred) => (
              <label
                key={cred.id}
                className="group flex cursor-pointer items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={selectedCredentials.includes(cred.name)}
                  onChange={() =>
                    handleMultiFilterChange("credential_title", cred.name)
                  }
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />

                <span
                  className={`text-[13px] leading-5 ${selectedCredentials.includes(cred.name)
                    ? "font-bold text-blue-600"
                    : "text-gray-700 group-hover:text-gray-900"
                    }`}
                >
                  {cred.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Institution */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500 ">
          Institution Type
        </h3>

        <div
          className="flex border border-gray-300 bg-gray-100 p-1 shadow-sm"
          style={{ borderRadius: "20px" }}
        >
          <button
            onClick={() => handleFilterChange("school_type", "public")}
            style={{ borderRadius: "35px" }}
            className={`flex-1 py-2 text-[13px] font-semibold transition-all duration-200 ${selectedCollegeType === "public"
              ? "border border-blue-300 bg-blue-50 text-blue-700 shadow-lg shadow-blue-200/50"
              : "text-gray-500 hover:text-gray-900"
              }`}
          >
            Public
          </button>

          <button
            onClick={() => handleFilterChange("school_type", "private")}
            style={{ borderRadius: "35px" }}
            className={`flex-1 py-2 text-[13px] font-semibold transition-all duration-200 ${selectedCollegeType === "private"
              ? "border border-blue-300 bg-blue-50 text-blue-700 shadow-lg shadow-blue-200/50"
              : "text-gray-500 hover:text-gray-900"
              }`}
          >
            Private
          </button>
        </div>
      </div>

      {/* State */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">State</h3>
        <div className="flex items-center bg-gray-50 border rounded-lg px-2 py-1.5 mb-3" style={{ borderRadius: "20px", borderColor: "lab(59 -0.22 -3.71)", }}>
          <Search size={14} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search States"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700"
          />
        </div>
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 degree-scrollbar">
          {filteredStates.map((s) => (
            <label key={s.state_code} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedStates.includes(s.state_code)}
                onChange={() => handleMultiFilterChange("state", s.state_code)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <span className={`text-[13px] transition-colors ${selectedStates.includes(s.state_code) ? 'text-blue-600 font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                {s.state_title}
              </span>
            </label>
          ))}
          {states.length === 0 && <p className="text-xs text-gray-400 italic">Loading states...</p>}
          {states.length > 0 && filteredStates.length === 0 && <p className="text-xs text-gray-400 italic">No states found</p>}
        </div>
      </div>

      {/* Tuition & Fees */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tuition & Fees</h3>
          <span className="text-[13px] font-medium text-gray-900">${tuitionRange[0] * 2}K-${tuitionRange[1] * 2}K</span>
        </div>
        <Slider
          range
          value={tuitionRange}
          onChange={handleTuitionChange}
          onChangeComplete={handleTuitionAfterChange}
          tooltip={{ formatter: (val) => `$${(val || 0) * 2}K` }}
        />
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: Floating filter button (visible below md) ── */}
      <button
        id="sidebar-filter-toggle"
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all duration-200"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 text-[11px] font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ── Mobile: Backdrop overlay ── */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── Mobile: Slide-in drawer (visible below md) ── */}
      <div
        id="sidebar-mobile-drawer"
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[11px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            id="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer body – scrollable filter content */}
        <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5 max-h-[calc(100vh-65px)] main-scrollbar">
          {filterContent}
        </div>
      </div>

      {/* ── Desktop / Tablet: Inline sidebar (visible at md+) ── */}
      <div className="hidden md:flex w-56 shrink-0 flex-col gap-6 md:sticky md:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 main-scrollbar">
        {filterContent}
      </div>
    </>
  );
}
