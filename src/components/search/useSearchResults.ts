"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { CATEGORY_KEYWORDS } from "@/constants/searchCategories";
import { buildSearchRequest, PAGE_SIZE_OPTIONS } from "@/lib/search/searchRequest";
import { filterSearchResults } from "@/lib/search/searchFilters";
import { SearchResult, ViewMode } from "@/types/search-details";

import { ServerSearchBundle } from "@/lib/search/searchServer";

const GRID_ITEMS_PER_PAGE = 12;
const LIST_ITEMS_PER_PAGE = 10;

export function useSearchResults(initialData?: ServerSearchBundle) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<SearchResult[]>(
    () => initialData?.results || [],
  );
  const [totalCount, setTotalCount] = useState<number | null>(
    () => initialData?.totalCount ?? null,
  );
  const [isServerPaginated, setIsServerPaginated] = useState<boolean>(
    () => initialData?.isServerPaginated || false,
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const defaultItemsPerPage =
    viewMode === "grid" ? GRID_ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE;
  const perPageParam = parseInt(searchParams.get("per_page") || "", 10);
  const itemsPerPage = (PAGE_SIZE_OPTIONS as readonly number[]).includes(
    perPageParam,
  )
    ? perPageParam
    : defaultItemsPerPage;
  const category = searchParams.get("category") || "";

  // Derive current page from URL parameter (default: 1)
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page > 1) {
        params.set("page", String(page));
      } else {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Changing how many results are shown per page also resets to page 1 —
  // otherwise the user could land on a page past the new, shorter total.
  const handlePageSizeChange = useCallback(
    (size: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (size === defaultItemsPerPage) {
        params.delete("per_page");
      } else {
        params.set("per_page", String(size));
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, defaultItemsPerPage],
  );

  useEffect(() => {
    window.scrollTo(0, 0);

    const controller = new AbortController();

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const { requestParams, selectedCredentials, selectedStates } =
          buildSearchRequest(searchParams, category, currentPage, itemsPerPage);

        const res = await fetch(
          `/api/proxy/search?${requestParams.toString()}`,
          { signal: controller.signal },
        );
        const data = await res.json();

        let rawResults: SearchResult[] = [];
        let serverTotal: number | null = null;
        let serverPaginated = false;

        if (res.ok) {
          if (Array.isArray(data)) {
            rawResults = data;
          } else if (data && typeof data === "object") {
            if (Array.isArray(data.results)) {
              rawResults = data.results;
              serverPaginated = true;
            }
            if (typeof data.total === "number") {
              serverTotal = data.total;
            } else if (typeof data.count === "number") {
              serverTotal = data.count;
            }
          }

          const filteredData = filterSearchResults(rawResults, {
            schoolType: searchParams.get("school_type"),
            selectedCredentials,
            selectedStates,
            categoryKeywords: category ? CATEGORY_KEYWORDS[category] : null,
          });

          setResults(filteredData);
          setTotalCount(serverTotal);
          setIsServerPaginated(serverPaginated);
        } else {
          setResults([]);
          setTotalCount(null);
          setIsServerPaginated(false);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [searchParams, category, currentPage, itemsPerPage]);

  const totalPages = Math.max(
    1,
    totalCount !== null
      ? Math.ceil(totalCount / itemsPerPage)
      : Math.ceil(results.length / itemsPerPage),
  );

  const currentResults = isServerPaginated
    ? results
    : results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      );

  return {
    isLoading,
    currentPage,
    setCurrentPage: handlePageChange,
    viewMode,
    setViewMode,
    totalPages,
    currentResults,
    category,
    pageSize: itemsPerPage,
    setPageSize: handlePageSizeChange,
  };
}

