"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CATEGORY_KEYWORDS } from "@/constants/searchCategories";
import { buildSearchRequest } from "@/lib/search/searchRequest";
import { filterSearchResults } from "@/lib/search/searchFilters";
import { SearchResult, ViewMode } from "@/types/search-details";

const GRID_ITEMS_PER_PAGE = 12;
const LIST_ITEMS_PER_PAGE = 10;

export function useSearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const itemsPerPage =
    viewMode === "grid" ? GRID_ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE;
  const category = searchParams.get("category") || "";

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const { requestParams, selectedCredentials, selectedStates } =
          buildSearchRequest(searchParams, category);

        const res = await fetch(
          `/api/proxy/search?${requestParams.toString()}`,
        );
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          const filteredData = filterSearchResults(data, {
            schoolType: searchParams.get("school_type"),
            selectedCredentials,
            selectedStates,
            categoryKeywords: category ? CATEGORY_KEYWORDS[category] : null,
          });

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

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return {
    isLoading,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    totalPages,
    currentResults,
    category,
  };
}
