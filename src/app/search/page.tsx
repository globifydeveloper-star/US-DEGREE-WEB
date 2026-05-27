"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TopSearchBar from "@/components/search/TopSearchBar";
import SearchHeader from "@/components/search/SearchHeader";
import SearchSidebar from "@/components/search/SearchSidebar";
import ResultCard from "@/components/search/ResultCard";
import TileCard from "@/components/search/TileCard";
import Pagination from "@/components/search/Pagination";
import { ResultListSkeleton, TileGridSkeleton, SearchHeaderSkeleton } from "@/components/search/SearchSkeletons";
import { SearchResult } from "@/types/search-details";

type ViewMode = 'list' | 'grid';

const getCollegeType = (result: SearchResult) => result.college_type || result.school_type || "";

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
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const requestParams = new URLSearchParams(searchParams.toString());

        // Remove params that we'll filter client-side
        requestParams.delete("school_type");

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
            filteredData = filteredData.filter((item: SearchResult) => matchesCollegeType(item, schoolType));
          }

          // Client-side filtering for multiple credential titles
          if (selectedCredentials.length > 1) {
            filteredData = filteredData.filter((item: SearchResult) =>
              selectedCredentials.some(cred =>
                item.credential_title?.toLowerCase() === cred.toLowerCase()
              )
            );
          }

          // Client-side filtering for multiple states
          if (selectedStates.length > 1) {
            filteredData = filteredData.filter((item: SearchResult) =>
              selectedStates.some(st =>
                item.state?.toLowerCase() === st.toLowerCase()
              )
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
  }, [searchParams]);

  const mapToCardProps = (result: SearchResult) => {
    const hasValue = (value: number | string | null | undefined) => value !== null && value !== undefined;

    return {
      id: result.unitid,
      cipCode: result.cip_code,
      university: result.school_name || "Unknown University",
      location: `${result.city || "Unknown"}, ${result.state || "US"}`,
      degree: result.program_title || "Unknown Degree",
      schoolType: getCollegeType(result) || "Unknown",
      admissionRate: hasValue(result.admission_rate) ? `${(Number(result.admission_rate) * 100).toFixed(1)}%` : "N/A",
      avgGpa: "N/A",
      satAct: hasValue(result.school_min_range) && hasValue(result.school_max_range)
        ? `${result.school_min_range} - ${result.school_max_range}`
        : "N/A",
      duration: "4 Years", // Default fallback if not provided
      specializations: result.credential_title || "N/A",
      matchScore: 90, // Placeholder
      gradRate: hasValue(result.emp_factor) ? parseFloat(Number(result.emp_factor).toFixed(1)) : 0,
      avgSalary: hasValue(result.earnings_year_5) ? `$${Math.round(Number(result.earnings_year_5)).toLocaleString()}` : undefined,
      estCost: hasValue(result.tuition_in_state) ? `$${Math.round(Number(result.tuition_in_state)).toLocaleString()}` : undefined,
      medianSalary: hasValue(result.earnings_year_5) ? `$${Math.round(Number(result.earnings_year_5)).toLocaleString()}` : undefined,
      roi: hasValue(result.roi_20yr) ? `$${Math.round(Number(result.roi_20yr) / 1000)}K` : undefined,
      logoColor: "bg-blue-600",
    };
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1">
      <TopSearchBar />
      
      <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <SearchSidebar />

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          {isLoading ? (
            <>
              <SearchHeaderSkeleton />
              {viewMode === 'grid' ? <TileGridSkeleton count={6} /> : <ResultListSkeleton count={5} />}
            </>
          ) : (
            <>
              <SearchHeader view={viewMode} onViewChange={setViewMode} />
              {currentResults.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No results found.</p>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1">
          <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4">
            <SearchHeaderSkeleton />
            <ResultListSkeleton count={5} />
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
