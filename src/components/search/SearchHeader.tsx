import React from "react";
import {
  ChevronRight,
  X,
  LayoutList,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { Select } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { OPEN_FILTERS_EVENT } from "./SearchSidebar";

type ViewMode = "list" | "grid";

const STATE_MAP: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  PR: "Puerto Rico",
};

const FILTER_KEYS = ["state", "credential_title", "title", "school_type"];
const MULTI_VALUE_KEYS = new Set(["state", "credential_title"]);

interface SearchHeaderProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

export default function SearchHeader({
  view,
  onViewChange,
}: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const title = searchParams.get("title");
  const credentialTitle = searchParams.get("credential_title");
  const stateParam = searchParams.get("state");
  const sort = searchParams.get("sort") || "recommended";

  // Parse multi-value params for heading
  const stateCodes = stateParam?.split(",").filter(Boolean) ?? [];
  const credentialTitles = credentialTitle?.split(",").filter(Boolean) ?? [];

  const firstStateName =
    stateCodes.length > 0
      ? STATE_MAP[stateCodes[0].toUpperCase()] || stateCodes[0]
      : null;
  const stateHeading = firstStateName
    ? stateCodes.length > 1
      ? `in ${firstStateName} +${stateCodes.length - 1} more`
      : `in ${firstStateName}`
    : "";

  const headingPrefix =
    title ||
    (credentialTitles.length === 1
      ? credentialTitles[0]
      : credentialTitles.length > 1
        ? "Multiple Degrees"
        : "Degree");
  const heading = `${headingPrefix} Programs ${stateHeading}`.trim();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // For multi-value keys, remove only the specific value from the comma list
    if (value && MULTI_VALUE_KEYS.has(key)) {
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(","));
      } else {
        params.delete(key);
      }
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep sort if it's there? Usually clear means everything or just filters.
    // Let's keep sort.
    if (searchParams.has("sort")) {
      params.set("sort", searchParams.get("sort")!);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getActiveFilters = () => {
    const active: { key: string; value: string; display: string }[] = [];
    FILTER_KEYS.forEach((key) => {
      const raw = searchParams.get(key);
      if (!raw) return;

      if (MULTI_VALUE_KEYS.has(key)) {
        // Split comma-separated values into individual chips
        const values = raw.split(",").filter(Boolean);
        values.forEach((val) => {
          let display = val;
          if (key === "state") display = STATE_MAP[val.toUpperCase()] || val;
          active.push({ key, value: val, display });
        });
      } else {
        let display = raw;
        if (key === "school_type")
          display = raw.charAt(0).toUpperCase() + raw.slice(1);
        active.push({ key, value: raw, display });
      }
    });
    return active;
  };

  const activeFilters = getActiveFilters();

  // Count of active filter groups, mirrors the drawer badge in SearchSidebar
  // (state, credential, institution type, tuition range).
  const mobileFilterCount =
    (stateCodes.length > 0 ? 1 : 0) +
    (credentialTitles.length > 0 ? 1 : 0) +
    (searchParams.get("school_type") ? 1 : 0) +
    (searchParams.get("tuition_min") || searchParams.get("tuition_max")
      ? 1
      : 0);

  const openMobileFilters = () => {
    window.dispatchEvent(new Event(OPEN_FILTERS_EVENT));
  };

  return (
    <div className="w-full mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-xs text-gray-500 mb-4 gap-1">
        <span
          className="hover:text-blue-600 cursor-pointer"
          onClick={() => router.push("/")}
        >
          Home
        </span>
        <ChevronRight size={12} />
        <span
          className="hover:text-blue-600 cursor-pointer"
          onClick={() => router.push("/search")}
        >
          Degrees
        </span>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium capitalize">
          {headingPrefix}
        </span>
      </div>

      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 mb-1.5 capitalize">
            {heading}
          </h1>
          <p className="text-sm text-gray-600">
            Discover accredited programs tailored to your professional goals.
          </p>
        </div>

        {/* View Toggle + Sort (+ mobile Filters) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Mobile Filters trigger — sits side by side with "Sort by" so it's
              always reachable at the top (never behind the bottom nav dock). */}
          <button
            type="button"
            onClick={openMobileFilters}
            className="md:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 active:scale-95 transition-all"
          >
            <SlidersHorizontal size={16} />
            Filters
            {mobileFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                {mobileFilterCount}
              </span>
            )}
          </button>

          {/* List / Grid toggle */}
          <div className="hidden md:flex items-center bg-gray-100 border border-gray-200 rounded-lg p-0.5">
            {" "}
            <button
              onClick={() => onViewChange("list")}
              title="List view"
              className={`p-1.5 rounded-md transition ${
                view === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => onViewChange("grid")}
              title="Tile view"
              className={`p-1.5 rounded-md transition ${
                view === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex flex-1 md:flex-none items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm md:min-w-[200px]">
            <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">
              Sort by:
            </span>
            <Select
              value={sort}
              variant="borderless"
              className="w-full font-medium text-gray-900"
              onChange={handleSortChange}
              options={[
                { value: "recommended", label: "Recommended" },
                { value: "tuition_low", label: "Tuition (Low to High)" },
                { value: "admission_high", label: "Admission Rate (High)" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <div
            key={`${filter.key}-${filter.value}`}
            onClick={() => removeFilter(filter.key, filter.value)}
            className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100 transition"
          >
            {filter.display}
            <X size={12} className="opacity-60" />
          </div>
        ))}

        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-medium text-gray-500 hover:text-blue-600 ml-2 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
