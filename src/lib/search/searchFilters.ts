import { SearchResult } from "@/types/search-details";

export const getCollegeType = (result: SearchResult) =>
  result.college_type || result.school_type || "";

export const matchesCollegeType = (
  result: SearchResult,
  selectedType: string,
) => {
  const collegeType = getCollegeType(result).toLowerCase();

  if (selectedType === "public") {
    return collegeType.includes("public");
  }

  if (selectedType === "private") {
    return collegeType.includes("private");
  }

  return true;
};

interface SearchFilterArgs {
  schoolType: string | null;
  selectedCredentials: string[];
  selectedStates: string[];
  categoryKeywords: string[] | null;
}

const textMatchesKeyword = (text: string | null | undefined, kw: string) =>
  Boolean(text && text.toLowerCase().includes(kw.toLowerCase()));

// Client-side narrowing of the broad result set returned by the API for
// filters the API can't apply itself (school type, multi-value credential /
// state selections, and category keyword matching).
export const filterSearchResults = (
  data: SearchResult[],
  { schoolType, selectedCredentials, selectedStates, categoryKeywords }: SearchFilterArgs,
): SearchResult[] => {
  let filteredData = data;

  if (schoolType) {
    filteredData = filteredData.filter((item) =>
      matchesCollegeType(item, schoolType),
    );
  }

  if (selectedCredentials.length > 1) {
    filteredData = filteredData.filter((item) =>
      selectedCredentials.some(
        (cred) => item.credential_title?.toLowerCase() === cred.toLowerCase(),
      ),
    );
  }

  if (selectedStates.length > 1) {
    filteredData = filteredData.filter((item) =>
      selectedStates.some(
        (st) => item.state?.toLowerCase() === st.toLowerCase(),
      ),
    );
  }

  if (categoryKeywords && categoryKeywords.length > 0) {
    filteredData = filteredData.filter((item) =>
      categoryKeywords.some(
        (kw) =>
          textMatchesKeyword(item.program_title, kw) ||
          textMatchesKeyword(item.credential_title, kw),
      ),
    );
  }

  return filteredData;
};
