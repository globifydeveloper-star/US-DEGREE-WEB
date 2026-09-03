import { getBackendBaseUrl } from "@/lib/env";
import { CATEGORY_KEYWORDS } from "@/constants/searchCategories";
import { buildSearchRequest, PAGE_SIZE_OPTIONS } from "@/lib/search/searchRequest";
import { filterSearchResults } from "@/lib/search/searchFilters";
import { SearchResult } from "@/types/search-details";

export interface ServerSearchBundle {
  results: SearchResult[];
  totalCount: number | null;
  currentPage: number;
  itemsPerPage: number;
  category: string;
  isServerPaginated: boolean;
}

export async function fetchServerSearchResults(
  rawSearchParams: Record<string, string | string[] | undefined>,
): Promise<ServerSearchBundle> {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      urlSearchParams.set(key, value.join(","));
    } else {
      urlSearchParams.set(key, value);
    }
  }

  // URLSearchParams implementation compatible with ReadonlyURLSearchParams
  const searchParams = urlSearchParams as unknown as import("next/navigation").ReadonlyURLSearchParams;

  const category = urlSearchParams.get("category") || "";
  const schoolType = urlSearchParams.get("school_type");
  const viewMode = urlSearchParams.get("view") || "list";
  const defaultItemsPerPage = viewMode === "grid" ? 12 : 10;
  const perPageParam = parseInt(urlSearchParams.get("per_page") || "", 10);
  const itemsPerPage = (PAGE_SIZE_OPTIONS as readonly number[]).includes(
    perPageParam,
  )
    ? perPageParam
    : defaultItemsPerPage;

  const pageParam = parseInt(urlSearchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  try {
    const { requestParams, selectedCredentials, selectedStates } =
      buildSearchRequest(searchParams, category, currentPage, itemsPerPage);

    const backendUrl = `${getBackendBaseUrl()}/search?${requestParams.toString()}`;
    const res = await fetch(backendUrl, { cache: "no-store" });

    if (!res.ok) {
      return {
        results: [],
        totalCount: null,
        currentPage,
        itemsPerPage,
        category,
        isServerPaginated: false,
      };
    }

    const data = await res.json();
    let rawResults: SearchResult[] = [];
    let serverTotal: number | null = null;
    let serverPaginated = false;

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
      schoolType,
      selectedCredentials,
      selectedStates,
      categoryKeywords: category ? CATEGORY_KEYWORDS[category] : null,
    });

    return {
      results: filteredData,
      totalCount: serverTotal,
      currentPage,
      itemsPerPage,
      category,
      isServerPaginated: serverPaginated,
    };
  } catch (error) {
    console.error("Server search fetch failed:", error);
    return {
      results: [],
      totalCount: null,
      currentPage,
      itemsPerPage,
      category,
      isServerPaginated: false,
    };
  }
}
