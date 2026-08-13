import { describe, it, expect } from "vitest";
import { filterSearchResults, matchesCollegeType, getCollegeType } from "./searchFilters";
import type { SearchResult } from "@/types/search-details";

function result(over: Partial<SearchResult> = {}): SearchResult {
  return {
    college_type: "Public",
    credential_title: "Bachelor's Degree",
    state: "CA",
    program_title: "Computer Science",
    ...over,
  } as SearchResult;
}

describe("getCollegeType", () => {
  it("prefers college_type", () => {
    expect(
      getCollegeType(result({ college_type: "Public", school_type: "Private" })),
    ).toBe("Public");
  });

  it("falls back to school_type when college_type is absent", () => {
    expect(
      getCollegeType(result({ college_type: undefined, school_type: "Private" })),
    ).toBe("Private");
  });

  it("returns an empty string when neither is present", () => {
    expect(
      getCollegeType(result({ college_type: undefined, school_type: undefined })),
    ).toBe("");
  });
});

describe("matchesCollegeType", () => {
  it("matches public against varied backend spellings", () => {
    expect(matchesCollegeType(result({ college_type: "Public, 4-year" }), "public")).toBe(true);
    expect(matchesCollegeType(result({ college_type: "PUBLIC" }), "public")).toBe(true);
  });

  it("does not match private results against public", () => {
    expect(
      matchesCollegeType(result({ college_type: "Private not-for-profit" }), "public"),
    ).toBe(false);
  });

  it("matches private", () => {
    expect(
      matchesCollegeType(result({ college_type: "Private for-profit" }), "private"),
    ).toBe(true);
  });

  it("passes everything through for an unrecognised selection", () => {
    expect(matchesCollegeType(result(), "anything-else")).toBe(true);
  });
});

describe("filterSearchResults", () => {
  const none = {
    schoolType: null,
    selectedCredentials: [],
    selectedStates: [],
    categoryKeywords: null,
  };

  it("returns the input unchanged when no filters are active", () => {
    const data = [result(), result({ state: "NY" })];
    expect(filterSearchResults(data, none)).toEqual(data);
  });

  it("filters by school type", () => {
    const data = [
      result({ college_type: "Public" }),
      result({ college_type: "Private" }),
    ];
    expect(filterSearchResults(data, { ...none, schoolType: "public" })).toHaveLength(1);
  });

  // Single-value credential/state selections are applied by the API, so the
  // client deliberately skips them; only multi-value selections are widened
  // client-side. Filtering on a single value here would double-apply it.
  it("ignores a single-value credential selection", () => {
    const data = [
      result({ credential_title: "Bachelor's Degree" }),
      result({ credential_title: "Master's Degree" }),
    ];
    expect(
      filterSearchResults(data, { ...none, selectedCredentials: ["Master's Degree"] }),
    ).toHaveLength(2);
  });

  it("applies a multi-value credential selection", () => {
    const data = [
      result({ credential_title: "Bachelor's Degree" }),
      result({ credential_title: "Master's Degree" }),
      result({ credential_title: "Certificate" }),
    ];
    const filtered = filterSearchResults(data, {
      ...none,
      selectedCredentials: ["Bachelor's Degree", "Master's Degree"],
    });
    expect(filtered).toHaveLength(2);
  });

  it("matches credentials case-insensitively", () => {
    const data = [result({ credential_title: "BACHELOR'S DEGREE" })];
    expect(
      filterSearchResults(data, {
        ...none,
        selectedCredentials: ["bachelor's degree", "Master's Degree"],
      }),
    ).toHaveLength(1);
  });

  it("ignores a single-value state selection but applies multi-value", () => {
    const data = [result({ state: "CA" }), result({ state: "NY" }), result({ state: "TX" })];
    expect(filterSearchResults(data, { ...none, selectedStates: ["CA"] })).toHaveLength(3);
    expect(
      filterSearchResults(data, { ...none, selectedStates: ["CA", "NY"] }),
    ).toHaveLength(2);
  });

  it("filters by category keyword substring, case-insensitively", () => {
    const data = [
      result({ program_title: "Computer Science" }),
      result({ program_title: "Nursing" }),
    ];
    expect(
      filterSearchResults(data, { ...none, categoryKeywords: ["comput"] }),
    ).toHaveLength(1);
  });

  it("combines filters conjunctively", () => {
    const data = [
      result({ college_type: "Public", state: "CA", program_title: "Nursing" }),
      result({ college_type: "Private", state: "CA", program_title: "Nursing" }),
      result({ college_type: "Public", state: "TX", program_title: "Nursing" }),
    ];
    const filtered = filterSearchResults(data, {
      ...none,
      schoolType: "public",
      selectedStates: ["CA", "NY"],
      categoryKeywords: ["nurs"],
    });
    expect(filtered).toHaveLength(1);
  });

  it("tolerates rows with missing or null fields rather than throwing", () => {
    const data = [
      result({ credential_title: undefined, state: undefined, program_title: undefined }),
      result({ credential_title: null as unknown as string, state: null as unknown as string, program_title: null as unknown as string }),
    ];
    expect(() =>
      filterSearchResults(data, {
        ...none,
        selectedCredentials: ["a", "b"],
        selectedStates: ["CA", "NY"],
        categoryKeywords: ["x"],
      }),
    ).not.toThrow();
  });

  it("matches category keywords against credential_title when program_title is null", () => {
    const data = [
      result({ program_title: null as unknown as string, credential_title: "Master of Business Administration" }),
    ];
    const filtered = filterSearchResults(data, {
      ...none,
      categoryKeywords: ["business"],
    });
    expect(filtered).toHaveLength(1);
  });
});
