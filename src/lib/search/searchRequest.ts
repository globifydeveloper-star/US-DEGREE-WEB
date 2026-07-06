import type { ReadonlyURLSearchParams } from "next/navigation";

import { CATEGORY_KEYWORDS } from "@/constants/searchCategories";

interface SearchRequest {
  requestParams: URLSearchParams;
  selectedCredentials: string[];
  selectedStates: string[];
}

// Translate the page's URL search params into the query sent to the API.
// School type and category are stripped (filtered client-side), and for
// multi-value credential/state selections only the API-narrowing first value
// is kept so a broad set is returned, then widened via client-side filtering.
export const buildSearchRequest = (
  searchParams: ReadonlyURLSearchParams,
  category: string,
): SearchRequest => {
  const requestParams = new URLSearchParams(searchParams.toString());

  requestParams.delete("school_type");
  requestParams.delete("category");

  // When a category is selected but no explicit search title exists, send the
  // primary category keyword as the title so the API returns relevant programs
  // instead of an empty / unfiltered result set.
  if (category && !requestParams.get("title")) {
    const categoryKws = CATEGORY_KEYWORDS[category];
    if (categoryKws && categoryKws.length > 0) {
      requestParams.set("title", categoryKws[0]);
    }
  }

  const credentialRaw = searchParams.get("credential_title") || "";
  const stateRaw = searchParams.get("state") || "";
  const selectedCredentials = credentialRaw.split(",").filter(Boolean);
  const selectedStates = stateRaw.split(",").filter(Boolean);

  if (selectedCredentials.length > 1) {
    requestParams.delete("credential_title");
  }
  if (selectedStates.length > 1) {
    requestParams.delete("state");
  }

  return { requestParams, selectedCredentials, selectedStates };
};
