import { describe, it, expect } from "vitest";
import { buildUniversityViewData } from "./buildUniversityViewData";
import type { UniversityApiBundle } from "./fetchUniversityData";
import type { UniversitySearchParams } from "@/types/university/apiResponses";

/** An all-empty bundle: every downstream endpoint returned nothing. */
function emptyBundle(over: Partial<UniversityApiBundle> = {}): UniversityApiBundle {
  return {
    apiData: null,
    outcomesData: null,
    campusData: null,
    tuitionData: null,
    collegeData: null,
    programsData: null,
    fetchedAccreditor: null,
    resolvedCip: null,
    athleticsData: null,
    ...over,
  } as UniversityApiBundle;
}

const noParams = {} as UniversitySearchParams;

describe("buildUniversityViewData", () => {
  describe("identity fields", () => {
    it("prefers search params over the API payload", async () => {
      const view = await buildUniversityViewData(
        "1001",
        { name: "From Params", city: "Austin", state: "TX" } as UniversitySearchParams,
        emptyBundle({
          collegeData: {
            school_name: "From API",
            city: "Boston",
            state: "MA",
          },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.name).toBe("From Params");
      expect(view.location).toBe("Austin, TX");
    });

    it("falls back to the API payload when params are absent", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          collegeData: { school_name: "API U", city: "Boston", state: "MA" },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.name).toBe("API U");
      expect(view.location).toBe("Boston, MA");
    });

    // A missing university must render a placeholder page, never crash the
    // route — this is the path a stale/bad /university/[id] link takes.
    it("degrades to placeholders when everything is missing", async () => {
      const view = await buildUniversityViewData("1001", noParams, emptyBundle());

      expect(view.name).toBe("Unknown University");
      expect(view.location).toBe("Unknown Location");
    });

    it("uses whichever of city or state is present", async () => {
      const cityOnly = await buildUniversityViewData(
        "1001",
        { city: "Austin" } as UniversitySearchParams,
        emptyBundle(),
      );
      expect(cityOnly.location).toBe("Austin");

      const stateOnly = await buildUniversityViewData(
        "1001",
        { state: "TX" } as UniversitySearchParams,
        emptyBundle(),
      );
      expect(stateOnly.location).toBe("TX");
    });
  });

  describe("derived percentages", () => {
    it("renders the admission rate as a percentage with one decimal", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          apiData: { admissions: { admission_rate: 0.6234 } },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.admissionRate).toBe("62.3%");
    });

    it("reports N/A when the admission rate is absent", async () => {
      const view = await buildUniversityViewData("1001", noParams, emptyBundle());
      expect(view.admissionRate).toBe("N/A");
    });

    it("renders the retention rate as a whole percentage", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          apiData: { students: { retention_rate: 0.874 } },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.retentionRate).toBe("87%");
    });
  });

  describe("faculty ratio normalisation", () => {
    it("keeps an already-formatted ratio", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          campusData: { campus: { student_faculty_ratio: "15:1" } },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.facultyRatio).toBe("15:1");
    });

    // The backend sends a bare number from one table and "n:1" from another.
    it("appends :1 to a bare number", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          campusData: { campus: { student_faculty_ratio: 15 } },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.facultyRatio).toBe("15:1");
    });

    it("reports N/A when absent", async () => {
      const view = await buildUniversityViewData("1001", noParams, emptyBundle());
      expect(view.facultyRatio).toBe("N/A");
    });
  });

  describe("sticker price", () => {
    it("sums tuition, books, room/board and other expenses", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          tuitionData: {
            tuition: { tuition_in_state: 10000, booksupply: 1000 },
            housing: { roomboard_oncampus: 8000 },
            expenses: { otherexpense_oncampus: 2000 },
          },
        } as Partial<UniversityApiBundle>),
      );

      expect(view.tuitionFee).toBe("$21,000");
    });

    it("substitutes documented defaults for missing components", async () => {
      const view = await buildUniversityViewData(
        "1001",
        noParams,
        emptyBundle({
          tuitionData: { tuition: { tuition_in_state: 10000 } },
        } as Partial<UniversityApiBundle>),
      );

      // 10000 + 1200 (books) + 7348 (room/board) + 2832 (other)
      expect(view.tuitionFee).toBe("$21,380");
    });

    it("falls back to the search param when no tuition data was returned", async () => {
      const view = await buildUniversityViewData(
        "1001",
        { tuition: "$30,000" } as UniversitySearchParams,
        emptyBundle(),
      );

      expect(view.tuitionFee).toBe("$30,000");
    });
  });
});
