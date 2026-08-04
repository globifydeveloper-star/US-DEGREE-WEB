import { describe, it, expect, beforeEach } from "vitest";
import {
  makeEntryId,
  parseEntryId,
  apiEntriesToMatrixIds,
  apiEntriesToPrograms,
  readEntryPrograms,
  writeEntryPrograms,
  writeMatrixEntries,
} from "./compareEntryIds";
import {
  ENTRY_PROGRAMS_KEY,
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
} from "@/hooks/useCompareCount";
import type { CompareMatrixEntry } from "@/lib/auth/api";

function entry(over: Partial<CompareMatrixEntry> = {}): CompareMatrixEntry {
  return {
    unitid: "1001",
    cipCode: "11.0701",
    credentialLevel: "5",
    programName: "Computer Science",
    credentialTitle: "Bachelor's Degree",
    ...over,
  };
}

describe("makeEntryId", () => {
  it("returns a bare unitid when there is no program", () => {
    expect(makeEntryId("1001", "")).toBe("1001");
    expect(makeEntryId("1001", "default")).toBe("1001");
  });

  it("suffixes cip code and credential level for a program entry", () => {
    expect(makeEntryId("1001", "11.0701", 5)).toBe("1001~11.0701~5");
  });

  // The same course at two credential levels must be separately addable, so
  // the level has to participate in the identity — keying on cip alone would
  // collapse a Bachelor's and a Master's into one entry.
  it("distinguishes the same course at different credential levels", () => {
    expect(makeEntryId("1001", "11.0701", 5)).not.toBe(
      makeEntryId("1001", "11.0701", 7),
    );
  });

  it("produces a stable id for the same course and level", () => {
    expect(makeEntryId("1001", "11.0701", "5")).toBe(makeEntryId("1001", "11.0701", 5));
  });

  it("normalises a missing credential level to 0", () => {
    expect(makeEntryId("1001", "11.0701")).toBe("1001~11.0701~0");
    expect(makeEntryId("1001", "11.0701", "")).toBe("1001~11.0701~0");
  });
});

describe("parseEntryId", () => {
  it("round-trips a program entry", () => {
    expect(parseEntryId(makeEntryId("1001", "11.0701", 5))).toEqual({
      unitid: "1001",
      cipCode: "11.0701",
      credentialLevel: "5",
    });
  });

  it("treats a bare unitid as the default program", () => {
    expect(parseEntryId("1001")).toEqual({
      unitid: "1001",
      cipCode: "default",
      credentialLevel: "",
    });
  });

  it("falls back to default for a malformed two-part id", () => {
    expect(parseEntryId("1001~11.0701")).toEqual({
      unitid: "1001",
      cipCode: "default",
      credentialLevel: "",
    });
  });
});

describe("apiEntriesToMatrixIds", () => {
  it("rebuilds ids from persisted rows", () => {
    expect(apiEntriesToMatrixIds([entry(), entry({ unitid: "2002" })])).toEqual([
      "1001~11.0701~5",
      "2002~11.0701~5",
    ]);
  });

  it("maps rows with no program to a bare unitid", () => {
    expect(
      apiEntriesToMatrixIds([entry({ cipCode: null, credentialLevel: null })]),
    ).toEqual(["1001"]);
  });

  it("returns an empty list for no rows", () => {
    expect(apiEntriesToMatrixIds([])).toEqual([]);
  });
});

describe("apiEntriesToPrograms", () => {
  it("keys program info by entry id", () => {
    expect(apiEntriesToPrograms([entry()])).toEqual({
      "1001~11.0701~5": {
        programName: "Computer Science",
        credentialTitle: "Bachelor's Degree",
      },
    });
  });

  it("skips rows with no program name", () => {
    expect(apiEntriesToPrograms([entry({ programName: null })])).toEqual({});
  });

  it("defaults a missing credential title to an empty string", () => {
    const map = apiEntriesToPrograms([entry({ credentialTitle: null })]);
    expect(map["1001~11.0701~5"].credentialTitle).toBe("");
  });

  it("keeps both entries when one college is compared under two programs", () => {
    const map = apiEntriesToPrograms([
      entry({ cipCode: "11.0701", programName: "CS" }),
      entry({ cipCode: "51.3801", programName: "Nursing" }),
    ]);
    expect(Object.keys(map)).toHaveLength(2);
  });
});

describe("entry program persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through localStorage", () => {
    const map = { "1001~11.0701~5": { programName: "CS", credentialTitle: "BS" } };
    writeEntryPrograms(map);
    expect(readEntryPrograms()).toEqual(map);
  });

  it("returns an empty map when nothing is stored", () => {
    expect(readEntryPrograms()).toEqual({});
  });

  // Corrupt storage must not take the compare page down on load.
  it("returns an empty map instead of throwing on corrupt JSON", () => {
    localStorage.setItem(ENTRY_PROGRAMS_KEY, "{not json");
    expect(readEntryPrograms()).toEqual({});
  });

  it("returns an empty map when the stored value is not an object", () => {
    localStorage.setItem(ENTRY_PROGRAMS_KEY, "null");
    expect(readEntryPrograms()).toEqual({});
  });
});

describe("writeMatrixEntries", () => {
  beforeEach(() => localStorage.clear());

  it("persists the ids the nav badge counts", () => {
    writeMatrixEntries(["1001", "2002~11.0701~5"]);
    expect(JSON.parse(localStorage.getItem(MATRIX_ENTRIES_KEY) ?? "[]")).toEqual([
      "1001",
      "2002~11.0701~5",
    ]);
  });

  // The badge subscribes to this event; without it the count goes stale until
  // the next full navigation.
  it("notifies listeners so the compare count updates immediately", () => {
    let fired = 0;
    const onChange = () => (fired += 1);
    window.addEventListener(MATRIX_UPDATED_EVENT, onChange);

    writeMatrixEntries(["1001"]);

    window.removeEventListener(MATRIX_UPDATED_EVENT, onChange);
    expect(fired).toBe(1);
  });
});
