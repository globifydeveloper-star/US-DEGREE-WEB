import { useEffect, useState, type RefObject } from "react";
import type { College } from "@/types/university/ComparisonTable";
import {
  fetchCompareMatrixDetails,
  hasAuthenticatedUser,
  type SelectedCompareCollege,
} from "@/lib/auth/api";
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

async function fetchPublicCompareDetail(
  entryId: string,
  entryProgramInfo?: { programName?: string; credentialTitle?: string },
): Promise<SelectedCompareCollege | null> {
  const { unitid, cipCode, credentialLevel } = parseEntryId(entryId);
  if (!unitid) return null;

  const apiUrl = "/api/proxy";
  const cipParam = cipCode && cipCode !== "default" ? cipCode : "default";

  try {
    const promises: [
      Promise<Response>,
      Promise<Response>,
      Promise<Response>,
      Promise<Response | null>,
    ] = [
      fetch(`${apiUrl}/overview/${unitid}/${cipParam}`),
      fetch(`${apiUrl}/tuition/${unitid}`),
      fetch(`${apiUrl}/colleges/${unitid}`),
      cipParam !== "default"
        ? fetch(`${apiUrl}/outcomes/${unitid}/${cipParam}`)
        : Promise.resolve(null),
    ];

    const [overviewRes, tuitionRes, collegeRes, outcomesRes] =
      await Promise.all(promises);

    let overviewData: any = {};
    let tuitionData: any = {};
    let collegeData: any = {};
    let outcomesData: any = {};

    if (overviewRes && overviewRes.ok) overviewData = await overviewRes.json();
    if (tuitionRes && tuitionRes.ok) tuitionData = await tuitionRes.json();
    if (collegeRes && collegeRes.ok) collegeData = await collegeRes.json();
    if (outcomesRes && outcomesRes.ok) outcomesData = await outcomesRes.json();

    const name =
      collegeData?.school_name ||
      collegeData?.name ||
      overviewData?.school_name ||
      overviewData?.school?.school_name ||
      overviewData?.school?.name ||
      null;

    const city = collegeData?.city || overviewData?.school?.city || "";
    const state = collegeData?.state || overviewData?.school?.state || "";
    const location =
      city && state ? `${city}, ${state}` : city || state || null;

    const schoolType =
      collegeData?.control || overviewData?.school?.control || null;
    const schoolUrl =
      collegeData?.school_url || overviewData?.school?.school_url || null;
    const accreditor = collegeData?.accreditor || null;

    const tuitionInState =
      tuitionData?.tuition?.tuition_in_state !== null &&
      tuitionData?.tuition?.tuition_in_state !== undefined
        ? Number(tuitionData.tuition.tuition_in_state)
        : null;

    const tuitionOutState =
      tuitionData?.tuition?.tuition_out_state !== null &&
      tuitionData?.tuition?.tuition_out_state !== undefined
        ? Number(tuitionData.tuition.tuition_out_state)
        : null;

    const stickerPrice =
      tuitionData?.tuition?.sticker_price !== null &&
      tuitionData?.tuition?.sticker_price !== undefined
        ? Number(tuitionData.tuition.sticker_price)
        : null;

    const avgDebt =
      tuitionData?.tuition?.avg_debt !== null &&
      tuitionData?.tuition?.avg_debt !== undefined
        ? Number(tuitionData.tuition.avg_debt)
        : null;

    const debtIncomeRatio =
      tuitionData?.tuition?.debt_income_ratio !== null &&
      tuitionData?.tuition?.debt_income_ratio !== undefined
        ? Number(tuitionData.tuition.debt_income_ratio)
        : null;

    const acceptanceRate =
      overviewData?.admissions?.admission_rate !== null &&
      overviewData?.admissions?.admission_rate !== undefined
        ? Number(overviewData.admissions.admission_rate)
        : null;

    const satRwMin = overviewData?.admissions?.sat_rw_min;
    const satMathMin = overviewData?.admissions?.sat_math_min;
    const satRwMax = overviewData?.admissions?.sat_rw_max;
    const satMathMax = overviewData?.admissions?.sat_math_max;
    const satAvgOverall = overviewData?.admissions?.sat_avg_overall;

    let satRangeLow: number | null = null;
    let satRangeHigh: number | null = null;
    if (satRwMin != null && satMathMin != null) {
      satRangeLow = Number(satRwMin) + Number(satMathMin);
    } else if (satAvgOverall != null) {
      satRangeLow = Math.max(400, Number(satAvgOverall) - 100);
    }

    if (satRwMax != null && satMathMax != null) {
      satRangeHigh = Number(satRwMax) + Number(satMathMax);
    } else if (satAvgOverall != null) {
      satRangeHigh = Math.min(1600, Number(satAvgOverall) + 100);
    }

    const rawGraduation = overviewData?.completion?.completion_rate;
    const graduationRate =
      rawGraduation !== null && rawGraduation !== undefined
        ? Number(rawGraduation) < 2
          ? Number(rawGraduation) * 100
          : Number(rawGraduation)
        : null;

    const resolvedEarnings =
      outcomesData?.earnings_resolved ?? overviewData?.earnings_resolved;
    const avgSalary =
      resolvedEarnings?.year_1 ??
      outcomesData?.earnings?.year_1 ??
      overviewData?.earnings?.year_1 ??
      null;

    const size =
      overviewData?.students?.size !== null &&
      overviewData?.students?.size !== undefined
        ? Number(overviewData.students.size)
        : null;

    const studentFacultyRatio = overviewData?.students?.student_faculty_ratio
      ? String(overviewData.students.student_faculty_ratio)
      : null;

    const programTitle =
      entryProgramInfo?.programName ||
      overviewData?.program?.title ||
      overviewData?.program?.program_name ||
      "";

    const selectedProgram =
      cipParam !== "default"
        ? {
            title: programTitle,
            cipCode,
            degreeLevelCategory: null,
            credentialLevel: credentialLevel ? Number(credentialLevel) : null,
            earnings: avgSalary,
          }
        : null;

    return {
      unitid: Number(unitid),
      name,
      location,
      tuitionInState,
      acceptanceRate,
      addedAt: null,
      schoolUrl,
      schoolType,
      accreditor,
      academics: {
        satRangeLow,
        satRangeHigh,
        graduationRate,
      },
      cost: {
        tuitionOutState,
        stickerPrice,
        avgDebt,
        debtIncomeRatio,
      },
      outcomes: {
        programEarnings:
          typeof avgSalary === "number"
            ? avgSalary
            : avgSalary?.value ?? null,
        avgSalary,
        roi20Yr: null,
      },
      students: {
        size,
      },
      programs: {
        studentFacultyRatio,
        repaymentSuccess: null,
        popularFields: [],
        degreeLevels: [],
        selectedProgram,
      },
    };
  } catch (err) {
    console.error(`Failed to fetch public details for ${entryId}:`, err);
    return null;
  }
}

interface DetailsFetchDeps {
  allUniversitiesRef: RefObject<Map<string, UniOption>>;
  cacheUniversity: (uni: RawUniversity) => UniOption | null;
}

/**
 * Resolves every id in the compare matrix against GET /compare/matrix/details
 * when logged in, or against public API endpoints when logged out / missing —
 * each row's `programs.selectedProgram` is resolved, and keeps the shared cross-app
 * details mirror in sync.
 */
export function useCompareDetailsFetch(
  comparedIds: string[],
  deps: DetailsFetchDeps,
  initialColleges?: College[],
) {
  const [comparedColleges, setComparedColleges] = useState<College[]>(
    () => initialColleges || [],
  );
  const [isDetailsLoading, setIsDetailsLoading] = useState(
    () => !initialColleges || initialColleges.length === 0,
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (comparedIds.length === 0) {
        setComparedColleges((prev) => (prev.length === 0 ? prev : []));
        setIsDetailsLoading(false);
        return;
      }

      // If initialColleges matches current comparedIds on first mount, skip re-fetching
      if (
        initialColleges &&
        initialColleges.length === comparedIds.length &&
        initialColleges.every((c, i) => c.id === comparedIds[i]) &&
        comparedColleges.length === initialColleges.length
      ) {
        setIsDetailsLoading(false);
        return;
      }

      setIsDetailsLoading(true);
      const storedDetails = readStoredDetails();
      const entryProgramsMap = readEntryPrograms();

      try {
        let list: SelectedCompareCollege[] = [];
        if (await hasAuthenticatedUser()) {
          try {
            list = await fetchCompareMatrixDetails();
          } catch (e) {
            console.error(
              "fetchCompareMatrixDetails failed, falling back to public fetch:",
              e,
            );
          }
        }
        if (cancelled) return;

        const baseByEntryId = matchDetailsToEntries(comparedIds, list);

        // For any entryId missing from baseByEntryId (unauthenticated visitor or
        // newly added local entry), fetch public details so every entry has full
        // metric coverage.
        const missingEntryIds = comparedIds.filter(
          (id) => !baseByEntryId.has(id),
        );

        if (missingEntryIds.length > 0) {
          const publicDetails = await Promise.all(
            missingEntryIds.map((id) =>
              fetchPublicCompareDetail(id, entryProgramsMap[id]),
            ),
          );
          if (cancelled) return;

          missingEntryIds.forEach((id, index) => {
            const detail = publicDetails[index];
            if (detail) {
              baseByEntryId.set(id, detail);
            }
          });
        }

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



