import { Search } from "lucide-react";
import { Select } from "antd";

import type { HeroSearchState } from "./useHeroSearch";

type CardVariant = "mobile" | "desktop";

interface CardStyles {
  container: string;
  toggleWrap: string;
  toggleInner: string;
  toggleButton: string;
  gridBase: string;
  gridPrograms: string;
  gridUniversities: string;
  label: string;
  selectSize: "large" | undefined;
  buttonWrap: string;
  button: string;
}

const CARD_STYLES: Record<CardVariant, CardStyles> = {
  mobile: {
    container:
      "w-full rounded-[20px] sm:rounded-[32px] bg-white p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.08)] mb-6 border border-slate-100 lg:hidden",
    toggleWrap: "flex justify-center mb-6",
    toggleInner: "flex bg-[#f5f5f5] p-1 rounded-full text-[11px] sm:text-sm",
    toggleButton:
      "px-2.5 sm:px-6 py-2 rounded-full font-medium transition cursor-pointer",
    gridBase: "grid gap-4",
    gridPrograms: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
    gridUniversities: "grid-cols-1 sm:grid-cols-2",
    label: "mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500",
    selectSize: "large",
    buttonWrap: "flex justify-end mt-6 w-full sm:w-auto",
    button:
      "flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 sm:px-8 text-white font-semibold hover:bg-[#1d4ed8] text-sm cursor-pointer",
  },
  desktop: {
    container:
      "w-full max-w-[1100px] rounded-[32px] bg-white p-6 shadow-[0_30px_50px_rgba(0,0,0,0.08)]",
    toggleWrap: "flex justify-center mb-8",
    toggleInner: "flex bg-[#f5f5f5] p-1 rounded-full",
    toggleButton:
      "px-6 py-2 rounded-full font-medium transition cursor-pointer",
    gridBase: "grid gap-5",
    gridPrograms: "md:grid-cols-3",
    gridUniversities: "md:grid-cols-2",
    label: "mb-2 text-xs font-bold uppercase tracking-wider text-gray-700",
    selectSize: undefined,
    buttonWrap: "flex justify-end mt-8",
    button:
      "flex h-12 items-center justify-center gap-2 rounded-full bg-[#2563eb] px-8 text-white font-semibold hover:bg-[#1d4ed8] cursor-pointer",
  },
};

interface HeroSearchCardProps {
  variant: CardVariant;
  search: HeroSearchState;
}

export default function HeroSearchCard({
  variant,
  search,
}: HeroSearchCardProps) {
  const styles = CARD_STYLES[variant];
  const {
    levels,
    states,
    courses,
    selectedLevel,
    selectedState,
    selectedCourse,
    isLoading,
    isCoursesLoading,
    searchType,
    setSearchType,
    setSelectedCourse,
    handleLevelChange,
    handleStateChange,
    handleSearch,
  } = search;

  const toggleButtonClass = (type: HeroSearchState["searchType"]) =>
    `${styles.toggleButton} ${
      searchType === type ? "bg-[#2563eb] text-white shadow" : "text-gray-600"
    }`;

  const gridClass = `${styles.gridBase} ${
    searchType === "programs" ? styles.gridPrograms : styles.gridUniversities
  }`;

  const hasSelection = Boolean(
    selectedLevel ||
    selectedState ||
    (searchType === "programs" && selectedCourse),
  );

  return (
    <div className={styles.container}>
      {/* Toggle */}
      <div className={styles.toggleWrap}>
        <div className={styles.toggleInner}>
          <button
            onClick={() => setSearchType("programs")}
            className={toggleButtonClass("programs")}
          >
            Search Programs
          </button>

          <button
            onClick={() => setSearchType("universities")}
            className={toggleButtonClass("universities")}
          >
            Search Universities
          </button>
        </div>
      </div>

      <div className={gridClass}>
        {/* Credential Field */}
        <div className="flex flex-col">
          <label className={styles.label}>Credential Level</label>
          <Select
            showSearch
            size={styles.selectSize}
            placeholder="Select Credential Level"
            options={levels}
            value={selectedLevel}
            onChange={handleLevelChange}
            className="w-full"
          />
        </div>

        {/* State field */}
        <div className="flex flex-col">
          <label className={styles.label}>States</label>
          <Select
            showSearch
            size={styles.selectSize}
            placeholder="Select a State"
            options={states}
            value={selectedState}
            onChange={handleStateChange}
            className="w-full"
          />
        </div>

        {/* Show course fields only for programs */}
        {searchType === "programs" && (
          <div className="flex flex-col">
            <label className={styles.label}>Course / Field of Study</label>
            <Select
              showSearch
              size={styles.selectSize}
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
      <div className={styles.buttonWrap}>
        <button
          onClick={handleSearch}
          disabled={isLoading || !hasSelection}
          className={`${styles.button} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2563eb]`}
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
  );
}
