"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopSearchBar from "@/components/search/TopSearchBar";
import SearchHeader from "@/components/search/SearchHeader";
import SearchSidebar from "@/components/search/SearchSidebar";
import ResultCard from "@/components/search/ResultCard";
import TileCard from "@/components/search/TileCard";
import Pagination from "@/components/search/Pagination";
import CompareDeck from "@/components/search/CompareDeck";
import {
  ResultListSkeleton,
  TileGridSkeleton,
  SearchHeaderSkeleton,
} from "@/components/search/SearchSkeletons";
import { SearchResult } from "@/types/search-details";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "computer-science": [
    "computer science",
    "software engineering",
    "cybersecurity",
    "information technology",
    "data science",
    "artificial intelligence",
  ],
  business: [
    "business",
    "finance",
    "accounting",
    "management",
    "marketing",
    "entrepreneurship",
  ],
  psychology: ["psychology", "behavioral science", "counseling"],
  "mechanical-engineering": ["mechanical engineering", "robotics", "aerospace"],
  "public-health": ["public health", "epidemiology", "health policy"],
  design: ["Design"],
};

const CATEGORY_LABELS: Record<string, string> = {
  "computer-science": "Computer Science",
  business: "Business",
  psychology: "Psychology",
  "mechanical-engineering": "Mechanical Engineering",
  "public-health": "Public Health",
  design: "Design",
};

type ViewMode = "list" | "grid";

const getCollegeType = (result: SearchResult) =>
  result.college_type || result.school_type || "";

const matchesCollegeType = (result: SearchResult, selectedType: string) => {
  const collegeType = getCollegeType(result).toLowerCase();

  if (selectedType === "public") {
    return collegeType.includes("public");
  }

  if (selectedType === "private") {
    return collegeType.includes("private");
  }

  return true;
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const itemsPerPage = viewMode === "grid" ? 12 : 10;
  const category = searchParams.get("category") || "";
  const categoryLabel = category
    ? CATEGORY_LABELS[category] ||
      category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const apiUrl = "/api/proxy";
        const requestParams = new URLSearchParams(searchParams.toString());

        // Remove params that we'll filter client-side
        requestParams.delete("school_type");
        requestParams.delete("category");

        // When a category is selected but no explicit search title exists,
        // send the primary category keyword as the title so the API returns
        // relevant programs instead of an empty / unfiltered result set.
        if (category && !requestParams.get("title")) {
          const categoryKws = CATEGORY_KEYWORDS[category];
          if (categoryKws && categoryKws.length > 0) {
            requestParams.set("title", categoryKws[0]);
          }
        }

        // For multi-value params (comma-separated), send only the first value
        // to the API so it returns a broad set, then filter client-side for all values.
        const credentialRaw = searchParams.get("credential_title") || "";
        const stateRaw = searchParams.get("state") || "";
        const selectedCredentials = credentialRaw.split(",").filter(Boolean);
        const selectedStates = stateRaw.split(",").filter(Boolean);

        // Send the first value to the API to narrow results somewhat,
        // then widen via client-side filtering for remaining values.
        if (selectedCredentials.length > 1) {
          requestParams.delete("credential_title");
        }
        if (selectedStates.length > 1) {
          requestParams.delete("state");
        }

        const res = await fetch(`${apiUrl}/search?${requestParams.toString()}`);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          let filteredData = data;

          // Client-side filtering for school_type
          const schoolType = searchParams.get("school_type");
          if (schoolType) {
            filteredData = filteredData.filter((item: SearchResult) =>
              matchesCollegeType(item, schoolType),
            );
          }

          // Client-side filtering for multiple credential titles
          if (selectedCredentials.length > 1) {
            filteredData = filteredData.filter((item: SearchResult) =>
              selectedCredentials.some(
                (cred) =>
                  item.credential_title?.toLowerCase() === cred.toLowerCase(),
              ),
            );
          }

          // Client-side filtering for multiple states
          if (selectedStates.length > 1) {
            filteredData = filteredData.filter((item: SearchResult) =>
              selectedStates.some(
                (st) => item.state?.toLowerCase() === st.toLowerCase(),
              ),
            );
          }

          // Client-side filtering for category keywords
          const categoryKws = category ? CATEGORY_KEYWORDS[category] : null;
          if (categoryKws && categoryKws.length > 0) {
            filteredData = filteredData.filter((item: SearchResult) =>
              categoryKws.some((kw) =>
                item.program_title?.toLowerCase().includes(kw.toLowerCase()),
              ),
            );
          }

          setResults(filteredData);
          setCurrentPage(1); // Reset to first page on new search
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, category]);

  const mapToCardProps = (result: SearchResult) => {
    const hasValue = (value: number | string | null | undefined) =>
      value !== null && value !== undefined;

    return {
      id: result.unitid,
      unitid: result.unitid != null ? String(result.unitid) : undefined,
      cipCode: result.cip_code,
      university: result.school_name || "Unknown University",
      location: `${result.city || "Unknown"}, ${result.state || "US"}`,
      degree: result.program_title || "Unknown Degree",
      schoolType: getCollegeType(result) || "Unknown",
      admissionRate: hasValue(result.admission_rate)
        ? `${(Number(result.admission_rate) * 100).toFixed(1)}%`
        : "N/A",
      avgGpa: "N/A",
      satAct:
        hasValue(result.school_min_range) && hasValue(result.school_max_range)
          ? `${result.school_min_range} - ${result.school_max_range}`
          : "N/A",
      duration: "4 Years", // Default fallback if not provided
      specializations: result.credential_title || "N/A",
      matchScore: 90, // Placeholder
      gradRate: hasValue(result.emp_factor)
        ? parseFloat(Number(result.emp_factor).toFixed(1))
        : 0,
      avgSalary: hasValue(result.earnings_year_5)
        ? `$${Math.round(Number(result.earnings_year_5)).toLocaleString()}`
        : undefined,
      estCost: hasValue(result.tuition_in_state)
        ? `$${Math.round(Number(result.tuition_in_state)).toLocaleString()}`
        : undefined,
      medianSalary: hasValue(result.earnings_year_5)
        ? `$${Math.round(Number(result.earnings_year_5)).toLocaleString()}`
        : undefined,
      roi: hasValue(result.roi_20yr)
        ? `$${Math.round(Number(result.roi_20yr) / 1000)}K`
        : undefined,
      logoColor: "bg-blue-600",
      schoolUrl: result.school_url,
    };
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <>
      <div className="flex-1 min-h-[75vh] flex flex-col">
        <TopSearchBar />
        <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <SearchSidebar />

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {isLoading ? (
              <>
                <SearchHeaderSkeleton />
                {viewMode === "grid" ? (
                  <TileGridSkeleton count={12} />
                ) : (
                  <ResultListSkeleton count={5} />
                )}
              </>
            ) : (
              <>
                {categoryLabel && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">Category:</span>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.delete("category");
                        router.push(`/search?${params.toString()}`);
                      }}
                      className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      {categoryLabel}
                      <X size={12} className="opacity-70" />
                    </button>
                  </div>
                )}
                <SearchHeader view={viewMode} onViewChange={setViewMode} />

                {currentResults.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">
                    No results found.
                  </p>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {currentResults.map((result, i) => (
                      <TileCard key={i} {...mapToCardProps(result)} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {currentResults.map((result, i) => (
                      <ResultCard key={i} {...mapToCardProps(result)} />
                    ))}
                  </div>
                )}
              </>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            />
          </div>
        </div>
      </div>

      {/* Back To Top Button */}
      {showBackToTop && (
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="
  fixed
bottom-24
md:bottom-24
lg:bottom-6
right-6
  z-50
  w-12
  h-12
  rounded-full

  backdrop-blur-xl
  bg-[#878cd7]/10
  border
  border-[#878cd7]/60

  shadow-lg
  transition-all
  duration-300

  text-gray-500
  hover:text-white
  hover:bg-blue-600
  hover:border-blue-500
  hover:scale-110
  active:scale-95
"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
      <CompareDeck />
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1">
            <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4">
              <SearchHeaderSkeleton />
              <ResultListSkeleton count={5} />
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
