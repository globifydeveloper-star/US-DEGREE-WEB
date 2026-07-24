import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";
import type { CompareMatrixEntry } from "@/lib/auth/api";

/**
 * Since we compare programs (not just colleges), the same college can appear
 * more than once — once per (course, credential level) pair. A bare unitid
 * entry stays backward compatible with plain unitids in the `ids` URL param
 * (e.g. university page links); a program-specific entry gets a
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

/** Rebuilds entry ids from persisted /compare/matrix rows. */
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
