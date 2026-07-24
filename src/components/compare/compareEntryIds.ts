import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";
import type { CompareMatrixEntry } from "@/lib/auth/api";

/**
 * Since we compare programs (not just colleges), the same college can appear
 * more than once — once per (course, credential level) pair. A bare unitid
 * entry stays backward compatible with every other page that still writes
 * plain unitids into the `ids` URL param (CompareDeck, CompareListSection,
 * university page links); a program-specific entry gets a
 * `~cipCode~credentialLevel` suffix. Keying on cipCode ALONE isn't enough —
 * the same course (cip_code) can be offered at more than one credential
 * level (e.g. Bachelor's vs Master's), and those must be addable as separate
 * entries, while re-adding the exact same course + level must still be
 * blocked.
 */
const ENTRY_SEP = "~";

export interface EntryProgramInfo {
  programName: string;
  credentialTitle: string;
}

export function makeEntryId(
  unitid: string,
  cipCode: string,
  credentialLevel?: number | string,
): string {
  if (!cipCode || cipCode === "default") return unitid;
  const level =
    credentialLevel === undefined || credentialLevel === null || credentialLevel === ""
      ? "0"
      : String(credentialLevel);
  return `${unitid}${ENTRY_SEP}${cipCode}${ENTRY_SEP}${level}`;
}

export function parseEntryId(entryId: string): {
  unitid: string;
  cipCode: string;
  credentialLevel: string;
} {
  const parts = entryId.split(ENTRY_SEP);
  if (parts.length < 3) {
    return { unitid: parts[0], cipCode: "default", credentialLevel: "" };
  }
  const [unitid, cipCode, credentialLevel] = parts;
  return { unitid, cipCode: cipCode || "default", credentialLevel };
}

export function readEntryPrograms(): Record<string, EntryProgramInfo> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(localStorage.getItem(ENTRY_PROGRAMS_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

export function writeEntryPrograms(map: Record<string, EntryProgramInfo>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTRY_PROGRAMS_KEY, JSON.stringify(map));
}

// The nav badge counts matrix entries (programs), not distinct colleges — see
// hooks/useCompareCount.ts. This is the sole writer of that key.
export function writeMatrixEntries(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATRIX_ENTRIES_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(MATRIX_UPDATED_EVENT));
}

/**
 * Entries to show for "whatever's queued to compare right now", merging the
 * shared college-level bucket (search cards, Intelligent Matches, university
 * page — anything outside the /compare page) with this page's own richer
 * per-program matrix: a college with one or more program-specific entries in
 * the matrix renders one id per program; a college only ever added elsewhere
 * renders as a single bare (no-program) id. Shared with CompareDeck so both
 * surfaces agree on what's queued.
 */
export function mergeCompareEntryIds(): string[] {
  if (typeof window === "undefined") return [];
  let bucket: string[] = [];
  let matrix: string[] = [];
  try {
    bucket = JSON.parse(localStorage.getItem("compared_colleges") || "[]");
  } catch {
    bucket = [];
  }
  try {
    matrix = JSON.parse(localStorage.getItem(MATRIX_ENTRIES_KEY) || "[]");
  } catch {
    matrix = [];
  }

  const matrixByUnitid = new Map<string, string[]>();
  matrix.forEach((entryId) => {
    const { unitid } = parseEntryId(entryId);
    const list = matrixByUnitid.get(unitid) || [];
    list.push(entryId);
    matrixByUnitid.set(unitid, list);
  });

  const result: string[] = [];
  bucket.forEach((unitid) => {
    const entries = matrixByUnitid.get(String(unitid));
    if (entries && entries.length > 0) {
      result.push(...entries);
    } else {
      result.push(String(unitid));
    }
  });
  return result;
}

/** Entry ids + the local program-name map -> the shape /compare/matrix persists. */
export function matrixEntryIdsToApi(ids: string[]): CompareMatrixEntry[] {
  const programs = readEntryPrograms();
  return ids.map((entryId) => {
    const { unitid, cipCode, credentialLevel } = parseEntryId(entryId);
    const info = programs[entryId];
    return {
      unitid,
      cipCode: cipCode === "default" ? null : cipCode,
      credentialLevel: credentialLevel || null,
      programName: info?.programName || null,
      credentialTitle: info?.credentialTitle || null,
    };
  });
}

/** The reverse of matrixEntryIdsToApi — rebuilds entry ids from persisted rows. */
export function apiEntriesToMatrixIds(entries: CompareMatrixEntry[]): string[] {
  return entries.map((e) =>
    makeEntryId(e.unitid, e.cipCode || "default", e.credentialLevel ?? undefined),
  );
}

/** The program-name map (ENTRY_PROGRAMS_KEY shape) rebuilt from persisted rows. */
export function apiEntriesToPrograms(
  entries: CompareMatrixEntry[],
): Record<string, EntryProgramInfo> {
  const map: Record<string, EntryProgramInfo> = {};
  entries.forEach((e) => {
    if (!e.programName) return;
    const entryId = makeEntryId(e.unitid, e.cipCode || "default", e.credentialLevel ?? undefined);
    map[entryId] = {
      programName: e.programName,
      credentialTitle: e.credentialTitle || "",
    };
  });
  return map;
}
