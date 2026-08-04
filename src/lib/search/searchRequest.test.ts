import { describe, it, expect } from "vitest";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { buildSearchRequest } from "./searchRequest";
import { CATEGORY_KEYWORDS } from "@/constants/searchCategories";

/** URLSearchParams is structurally compatible with the readonly Next type. */
function sp(init: string): ReadonlyURLSearchParams {
  return new URLSearchParams(init) as unknown as ReadonlyURLSearchParams;
}

describe("buildSearchRequest", () => {
  it("passes through unrelated params untouched", () => {
    const { requestParams } = buildSearchRequest(sp("title=nursing&page=2"), "");
    expect(requestParams.get("title")).toBe("nursing");
    expect(requestParams.get("page")).toBe("2");
  });

  // school_type and category are applied client-side by filterSearchResults;
  // sending them upstream would narrow the set the client still needs.
  it("strips the client-side-only params", () => {
    const { requestParams } = buildSearchRequest(
      sp("school_type=public&category=business&title=x"),
      "business",
    );
    expect(requestParams.has("school_type")).toBe(false);
    expect(requestParams.has("category")).toBe(false);
  });

  it("substitutes the primary category keyword as the title when none is set", () => {
    const { requestParams } = buildSearchRequest(sp("category=business"), "business");
    expect(requestParams.get("title")).toBe(CATEGORY_KEYWORDS.business[0]);
  });

  it("does not overwrite an explicit title with the category keyword", () => {
    const { requestParams } = buildSearchRequest(
      sp("category=business&title=accounting"),
      "business",
    );
    expect(requestParams.get("title")).toBe("accounting");
  });

  it("leaves the title unset for an unknown category", () => {
    const { requestParams } = buildSearchRequest(sp(""), "not-a-real-category");
    expect(requestParams.has("title")).toBe(false);
  });

  describe("multi-value selections", () => {
    // A single value is something the API can narrow on, so it is kept. Two or
    // more must be dropped so the API returns the union, which the client then
    // filters — otherwise only the first value's results would ever come back.
    it("keeps a single credential on the request", () => {
      const { requestParams, selectedCredentials } = buildSearchRequest(
        sp("credential_title=Bachelor%27s%20Degree"),
        "",
      );
      expect(requestParams.get("credential_title")).toBe("Bachelor's Degree");
      expect(selectedCredentials).toEqual(["Bachelor's Degree"]);
    });

    it("drops credential_title once more than one is selected", () => {
      const { requestParams, selectedCredentials } = buildSearchRequest(
        sp("credential_title=A,B"),
        "",
      );
      expect(requestParams.has("credential_title")).toBe(false);
      expect(selectedCredentials).toEqual(["A", "B"]);
    });

    it("keeps a single state but drops multiple", () => {
      expect(buildSearchRequest(sp("state=CA"), "").requestParams.get("state")).toBe("CA");
      expect(buildSearchRequest(sp("state=CA,NY"), "").requestParams.has("state")).toBe(false);
    });

    it("reports both selections back to the caller for client-side filtering", () => {
      const { selectedStates, selectedCredentials } = buildSearchRequest(
        sp("state=CA,NY,TX&credential_title=A,B"),
        "",
      );
      expect(selectedStates).toEqual(["CA", "NY", "TX"]);
      expect(selectedCredentials).toEqual(["A", "B"]);
    });

    it("ignores empty segments from trailing commas", () => {
      const { selectedStates } = buildSearchRequest(sp("state=CA,,NY,"), "");
      expect(selectedStates).toEqual(["CA", "NY"]);
    });

    it("returns empty arrays when nothing is selected", () => {
      const { selectedStates, selectedCredentials } = buildSearchRequest(sp(""), "");
      expect(selectedStates).toEqual([]);
      expect(selectedCredentials).toEqual([]);
    });
  });

  it("does not mutate the caller's search params", () => {
    const original = sp("school_type=public&title=x");
    buildSearchRequest(original, "");
    expect(original.get("school_type")).toBe("public");
  });
});
