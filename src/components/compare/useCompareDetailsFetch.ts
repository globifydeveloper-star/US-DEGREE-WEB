import { useEffect, useState, type RefObject } from "react";
import type { College } from "@/types/university/ComparisonTable";
import { fetchCompareMatrixDetails, type SelectedCompareCollege } from "@/lib/auth/api";
import { parseEntryId, readEntryPrograms } from "./compareEntryIds";
import { buildCollegeRow } from "./buildCollegeRow";
import type { RawUniversity, StoredDetail, UniOption } from "./compareCollegeTypes";

const DETAILS_MIRROR_KEY = "compared_colleges_details";

function readStoredDetails(): StoredDetail[] {
  try {
    const stored = localStorage.getItem(DETAILS_MIRROR_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as StoredDetail[]) : [];
  } catch (e) {
    console.error("Error reading stored details:", e);
    return [];
  }
}

// The shared cross-app mirror (read by search cards, the profile section)
// only ever holds one row per unitid — dedupe here so a college compared
// under two programs doesn't write two rows with the same id.
function writeSharedDetailsMirror(colleges: College[]) {
  const seenUnitids = new Set<string>();
  const details: StoredDetail[] = [];
  for (const c of colleges) {
    if (seenUnitids.has(c.unitid)) continue;
    seenUnitids.add(c.unitid);
    details.push({
      id: c.unitid,
      name: c.name,
      logo: c.logo,
      logoColor: "bg-blue-600",
      location: c.location,
      city: c.location?.includes(",") ? c.location.split(",")[0].trim() : "",
      state: c.state,
      schoolType: c.isPrivate ? "Private" : "Public",
      cipCode: c.cipCode || "default",
      programName: c.programName || "",
      schoolUrl: c.schoolUrl || "",
    });
  }
  localStorage.setItem(DETAILS_MIRROR_KEY, JSON.stringify(details));
}

/**
 * Match each requested entryId to its own row from GET /compare/matrix/details.
 * The backend returns rows in the same order as the compare_matrix_entries
 * table (id ASC) — the same order `comparedIds` is derived from — so a
 * positional zip is correct in the normal case. Falls back to matching by
 * unitid (one row consumed per match, in order) if the lengths ever diverge,
 * e.g. a stale URL from a shared link.
 */
function matchDetailsToEntries(
  entryIds: string[],
  details: SelectedCompareCollege[],
): Map<string, SelectedCompareCollege> {
  const map = new Map<string, SelectedCompareCollege>();
  if (entryIds.length === details.length) {
    entryIds.forEach((entryId, i) => map.set(entryId, details[i]));
    return map;
  }
  const byUnitid = new Map<string, SelectedCompareCollege[]>();
  details.forEach((c) => {
    if (c.unitid == null) return;
    const key = String(c.unitid);
    const arr = byUnitid.get(key) || [];
    arr.push(c);
    byUnitid.set(key, arr);
  });
  entryIds.forEach((entryId) => {
    const { unitid } = parseEntryId(entryId);
    const arr = byUnitid.get(unitid);
    if (arr && arr.length > 0) map.set(entryId, arr.shift()!);
  });
  return map;
}

interface DetailsFetchDeps {
  allUniversitiesRef: RefObject<Map<string, UniOption>>;
  cacheUniversity: (uni: RawUniversity) => UniOption | null;
}

/**
 * Resolves every id in the compare matrix against a single GET
 * /compare/matrix/details call — each row's `programs.selectedProgram` is
 * already resolved from that row's own cipCode/credentialLevel, no
 * per-program round trip needed — and keeps the shared cross-app details
 * mirror in sync.
 */
export function useCompareDetailsFetch(
  comparedIds: string[],
  deps: DetailsFetchDeps,
) {
  const [comparedColleges, setComparedColleges] = useState<College[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (comparedIds.length === 0) {
        setComparedColleges((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      setIsDetailsLoading(true);
      const storedDetails = readStoredDetails();
      const entryProgramsMap = readEntryPrograms();

      try {
        const list = await fetchCompareMatrixDetails();
        if (cancelled) return;

        const baseByEntryId = matchDetailsToEntries(comparedIds, list);

        const rows = comparedIds.map((entryId) =>
          buildCollegeRow(entryId, {
            baseByEntryId,
            storedDetails,
            entryProgramsMap,
            allUniversities: deps.allUniversitiesRef.current,
            cacheUniversity: deps.cacheUniversity,
          }),
        );

        setComparedColleges(rows);
        writeSharedDetailsMirror(rows);
      } catch (err) {
        console.error("Failed to load colleges details:", err);
      } finally {
        if (!cancelled) setIsDetailsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparedIds]);

  return { comparedColleges, isDetailsLoading };
}
