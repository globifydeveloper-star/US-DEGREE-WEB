import { useEffect, useState, type RefObject } from "react";
import type { College } from "@/types/university/ComparisonTable";
import { fetchCompareSelected } from "@/lib/auth/api";
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

// The shared cross-app mirror (read by CompareDeck, search cards, the profile
// section) only ever holds one row per unitid — dedupe here so a college
// compared under two programs doesn't write two rows with the same id.
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

// Which program name (if any) an entry needs resolved via `?program=`, so we
// call the backend once per distinct program instead of once per entry.
function programNameFor(entryId: string, storedDetails: StoredDetail[]) {
  const { unitid, cipCode } = parseEntryId(entryId);
  const isBareEntry = entryId === unitid;
  if (!isBareEntry) return cipCode !== "default" ? cipCode : "";
  const stored = storedDetails.find((d) => String(d.id) === unitid);
  return stored?.cipCode && stored.cipCode !== "default"
    ? stored.programName || ""
    : "";
}

interface DetailsFetchDeps {
  allUniversitiesRef: RefObject<Map<string, UniOption>>;
  cacheUniversity: (uni: RawUniversity) => UniOption | null;
}

/**
 * Resolves every id in the compare matrix against a single GET
 * /compare/selected?programs=... call — the backend resolves each compared
 * college's `programs.selectedProgram` against whichever program in the
 * list matches it, in one round trip — and keeps the shared cross-app
 * details mirror in sync. Replaces what used to be 4-5 separate backend
 * calls (`/overview`, `/tuition`, `/outcomes`, `/colleges`) per entry.
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
      const programNames = Array.from(
        new Set(
          comparedIds
            .map((id) => programNameFor(id, storedDetails))
            .filter(Boolean),
        ),
      );

      try {
        const list = await fetchCompareSelected(programNames);
        if (cancelled) return;

        const baseByUnitid = new Map(
          list
            .filter((c) => c.unitid != null)
            .map((c) => [String(c.unitid), c]),
        );

        const rows = comparedIds.map((entryId) =>
          buildCollegeRow(entryId, {
            baseByUnitid,
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
