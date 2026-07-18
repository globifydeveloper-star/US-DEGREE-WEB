import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { College, CollegeDetail } from "@/types/university/ComparisonTable";
import { authedFetch } from "@/lib/auth/api";
import {
  addToCompare,
  removeFromCompare,
  clearCompare,
} from "@/components/search/useCompareSelected";
import {
  MATRIX_ENTRIES_KEY,
  MATRIX_UPDATED_EVENT,
  ENTRY_PROGRAMS_KEY,
} from "@/hooks/useCompareCount";

const INITIAL_LIST_SIZE = 20;
const MIN_SEARCH_CHARS = 4;
const SEARCH_DEBOUNCE_MS = 300;

// Since we now compare programs (not just colleges), the same college can
// appear more than once — once per (course, credential level) pair. A bare
// unitid entry stays backward compatible with every other page that still
// writes plain unitids into the `ids` URL param (CompareDeck,
// CompareListSection, university page links); a program-specific entry gets
// a `~cipCode~credentialLevel` suffix. Keying on cipCode ALONE isn't enough —
// the same course (cip_code) can be offered at more than one credential
// level (e.g. Bachelor's vs Master's), and those must be addable as separate
// entries, while re-adding the exact same course + level must still be
// blocked.
const ENTRY_SEP = "~";

interface EntryProgramInfo {
  programName: string;
  credentialTitle: string;
}

function makeEntryId(
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

function readEntryPrograms(): Record<string, EntryProgramInfo> {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(localStorage.getItem(ENTRY_PROGRAMS_KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function writeEntryPrograms(map: Record<string, EntryProgramInfo>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTRY_PROGRAMS_KEY, JSON.stringify(map));
}

// The nav badge counts matrix entries (programs), not distinct colleges — see
// hooks/useCompareCount.ts. This is the sole writer of that key.
function writeMatrixEntries(ids: string[]) {
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

// ---- Types ----
export type UniOption = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  schoolType?: string;
};

interface RawUniversity {
  unitid?: string | number;
  id?: string | number;
  value?: string | number;
  school_name?: string;
  name?: string;
  label?: string;
  city?: string;
  state?: string;
  school_type?: string;
  college_type?: string;
  control?: string;
}

interface ApiSchool {
  school_name?: string;
  name?: string;
  state?: string;
  city?: string;
  control?: string;
  school_url?: string;
}

interface OverviewData {
  school_name?: string;
  school_url?: string;
  school?: ApiSchool;
  admissions?: {
    admission_rate?: number | null;
    sat_rw_min?: number | null;
    sat_math_min?: number | null;
    sat_rw_max?: number | null;
    sat_math_max?: number | null;
  };
  completion?: { completion_rate?: number | null };
  earnings?: { year_10?: number | string | null };
  students?: { size?: number | null };
}

interface TuitionData {
  tuition?: {
    tuition_in_state?: number | string | null;
    tuition_out_state?: number | string | null;
  };
}

interface OutcomesData {
  earnings?: { year_10?: number | string | null };
}

interface CollegeData {
  school_url?: string;
  school_name?: string;
  name?: string;
  city?: string;
  state?: string;
  school_type?: string;
  control?: string;
}

interface StoredDetail {
  id: string;
  name?: string;
  city?: string;
  state?: string;
  schoolType?: string;
  location?: string;
  cipCode?: string;
  programName?: string;
  schoolUrl?: string;
  logo?: string;
  logoColor?: string;
}

export function useCompareColleges() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- comparedIds is DERIVED from the URL (single source of truth) ----
  const idsParam = searchParams.get("ids");
  const comparedIds = useMemo<string[]>(
    () => (idsParam ? idsParam.split(",").filter(Boolean) : []),
    [idsParam],
  );

  const [comparedColleges, setComparedColleges] = useState<College[]>([]);

  // Selection search data
  const [selectOptions, setSelectOptions] = useState<UniOption[]>([]);
  // Rendered in the "Quick Add" list, so this is state (not a ref).
  const [initialUniversities, setInitialUniversities] = useState<UniOption[]>(
    [],
  );
  // Cache of EVERY college we have loaded. Used to resolve names/locations.
  const allUniversitiesRef = useRef<Map<string, UniOption>>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [collegeDetailsCache, setCollegeDetailsCache] = useState<
    Record<string, CollegeDetail>
  >({});
  const hydratedRef = useRef(false);

  // Fallback: if any compare API call returns 401, the session isn't valid —
  // redirect to login (once). The page is already auth-gated, so this only
  // triggers if the session expires mid-use.
  const redirectedRef = useRef(false);
  const handle401 = useCallback(
    (status: number): boolean => {
      if (status === 401 && !redirectedRef.current) {
        redirectedRef.current = true;
        router.replace("/?login=1");
        return true;
      }
      return false;
    },
    [router],
  );

  // Helper: normalise one raw API university row into a UniOption and cache it.
  const cacheUniversity = useCallback(
    (uni: RawUniversity): UniOption | null => {
      if (!uni) return null;
      const id = String(uni.unitid ?? uni.id ?? uni.value ?? "");
      if (!id) return null;
      const option: UniOption = {
        id,
        name: uni.school_name ?? uni.name ?? uni.label ?? "",
        city: uni.city ?? "",
        state: uni.state ?? "",
        schoolType:
          uni.school_type ?? uni.college_type ?? uni.control ?? "Public",
      };
      const existing = allUniversitiesRef.current.get(id);
      if (!existing || (!existing.name && option.name)) {
        allUniversitiesRef.current.set(id, option);
      }
      return option;
    },
    [],
  );

  // 1. Hydrate the URL from localStorage on first mount (one-time).
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (idsParam) {
      // Keep the badge's entry-level mirror in sync with whatever the URL
      // says on load. Deliberately NOT written to the shared "compared_colleges"
      // key — that one is college-level (bare unitids) and is exclusively
      // maintained by the addToCompare/removeFromCompare calls in
      // handleAddCollege/handleRemoveCollege below; writing composite entry
      // ids into it would break other consumers (e.g. CompareDeck) that match
      // on bare unitid.
      writeMatrixEntries(idsParam.split(",").filter(Boolean));
      return;
    }

    // No ids in the URL (e.g. the plain "/compare" nav link) — restore the
    // same merged view CompareDeck shows, so the two never disagree.
    try {
      const ids = mergeCompareEntryIds();
      if (ids.length > 0) {
        const params = new URLSearchParams();
        params.set("ids", ids.join(","));
        router.replace(`/compare?${params.toString()}`);
      }
    } catch (e) {
      console.error(e);
    }
  }, [idsParam, router]);

  // 2. Preload the initial dropdown list from /compare/colleges (returns up to 50).
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        // Authed call: attaches Authorization: Bearer <app JWT> and self-heals
        // a 401 via refresh + retry inside the wrapper.
        const res = await authedFetch("/compare/colleges");
        if (handle401(res.status)) return;
        if (res.ok) {
          const data: unknown = await res.json();
          if (Array.isArray(data)) {
            (data as RawUniversity[]).forEach((uni) => cacheUniversity(uni));

            const all = Array.from(allUniversitiesRef.current.values());
            const mapped = all.slice(0, INITIAL_LIST_SIZE);
            setInitialUniversities(mapped);
            setSelectOptions(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial college list:", err);
      }
    };
    fetchUniversities();
  }, [cacheUniversity, handle401]);

  // 2b. Debounced SERVER-SIDE search against the full DB via /compare/colleges?search=...
  const handleDropdownSearch = useCallback(
    (searchText: string) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }

      const trimmed = searchText.trim();

      if (trimmed.length < MIN_SEARCH_CHARS) {
        setSelectOptions(initialUniversities);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      searchTimerRef.current = setTimeout(async () => {
        try {
          const res = await authedFetch(
            `/compare/colleges?search=${encodeURIComponent(trimmed)}&limit=50`,
          );
          if (handle401(res.status)) return;
          if (res.ok) {
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
              const results: UniOption[] = [];
              const seen = new Set<string>();
              for (const uni of data as RawUniversity[]) {
                const opt = cacheUniversity(uni);
                if (opt && !seen.has(opt.id)) {
                  seen.add(opt.id);
                  results.push(opt);
                }
              }
              setSelectOptions(
                results.length > 0 ? results : initialUniversities,
              );
            }
          }
        } catch (err) {
          console.error("Failed to search colleges:", err);
        } finally {
          setIsSearching(false);
        }
      }, SEARCH_DEBOUNCE_MS);
    },
    [initialUniversities, cacheUniversity, handle401],
  );

  // 3. Keep URL query param synchronised with active compared IDs, and mirror
  // the entry-level list into the nav badge's local key.
  const syncUrlParams = useCallback(
    (ids: string[]) => {
      const params = new URLSearchParams();
      if (ids.length > 0) {
        params.set("ids", ids.join(","));
      }
      router.push(`/compare?${params.toString()}`);
      writeMatrixEntries(ids);
    },
    [router],
  );

  // 4. Fetch details for compared colleges dynamically.
  useEffect(() => {
    let cancelled = false;

    const sanitizeSalary = (
      val: number | string | null | undefined,
    ): number | null => {
      if (val === null || val === undefined) return null;
      const str = String(val).trim();
      if (
        str === "No Value" ||
        str === "N/A" ||
        str === "" ||
        str.toLowerCase() === "null"
      ) {
        return null;
      }
      const num = Number(str.replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? null : num;
    };

    const toNum = (val: number | string | null | undefined): number | null => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const run = async () => {
      if (comparedIds.length === 0) {
        setComparedColleges((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      setIsDetailsLoading(true);

      let storedDetails: StoredDetail[] = [];
      try {
        const stored = localStorage.getItem("compared_colleges_details");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) storedDetails = parsed as StoredDetail[];
        }
      } catch (e) {
        console.error("Error reading stored details:", e);
      }

      const entryProgramsMap = readEntryPrograms();

      try {
        const fetchPromises = comparedIds.map(async (entryId) => {
          const { unitid, cipCode: entryCipCode } = parseEntryId(entryId);
          // Bare entries (no `~cipCode` suffix) stay resolved the historical
          // way — via the shared cross-app details mirror — so links from
          // other pages (Intelligent Matches, university page, CompareDeck)
          // keep working unchanged. Suffixed entries carry their own
          // cipCode; programName for those comes from the compare-page-local
          // map, since the shared mirror only holds one program per unitid.
          const isBareEntry = entryId === unitid;
          const matchedStored = storedDetails.find(
            (d) => String(d.id) === String(unitid),
          );
          const cipCode = isBareEntry
            ? matchedStored?.cipCode || "default"
            : entryCipCode;
          const programInfo = entryProgramsMap[entryId];
          const programName =
            cipCode === "default"
              ? ""
              : isBareEntry
                ? matchedStored?.programName || ""
                : programInfo?.programName || "";
          const credentialTitle =
            cipCode === "default" ? "" : isBareEntry ? "" : programInfo?.credentialTitle || "";

          const [overviewRes, tuitionRes, outcomesRes, collegeRes] =
            await Promise.all([
              authedFetch(`/overview/${unitid}/${cipCode}`),
              authedFetch(`/tuition/${unitid}`),
              authedFetch(`/outcomes/${unitid}/${cipCode}`),
              authedFetch(`/colleges/${unitid}`),
            ]);

          // Session expired mid-use → bail out to login.
          if (
            handle401(overviewRes.status) ||
            handle401(tuitionRes.status) ||
            handle401(outcomesRes.status) ||
            handle401(collegeRes.status)
          ) {
            return null;
          }

          let overviewData: OverviewData = {};
          let tuitionData: TuitionData = {};
          let outcomesData: OutcomesData = {};
          let collegeData: CollegeData = {};

          if (overviewRes.ok) overviewData = await overviewRes.json();
          if (tuitionRes.ok) tuitionData = await tuitionRes.json();
          if (outcomesRes.ok) outcomesData = await outcomesRes.json();
          if (collegeRes.ok) collegeData = await collegeRes.json();

          // A specific program (non-"default" CIP) often has no outcomes row
          // of its own — fall back to the school-wide default earnings so the
          // salary metric isn't lost just because that program+school pairing
          // lacks its own record. Program Details still shows the real program.
          const hasCipOutcomes =
            sanitizeSalary(outcomesData?.earnings?.year_10) !== null;
          if (cipCode !== "default" && !hasCipOutcomes) {
            try {
              const fallbackRes = await authedFetch(
                `/outcomes/${unitid}/default`,
              );
              if (fallbackRes.ok) {
                outcomesData = await fallbackRes.json();
              }
            } catch (e) {
              console.error("Failed to load fallback outcomes:", e);
            }
          }

          const matchedUni =
            allUniversitiesRef.current.get(String(unitid)) ||
            selectOptions.find((uni) => String(uni.id) === String(unitid));

          const name =
            matchedUni?.name ||
            matchedStored?.name ||
            collegeData?.school_name ||
            collegeData?.name ||
            overviewData?.school_name ||
            overviewData?.school?.school_name ||
            overviewData?.school?.name ||
            "Unknown University";

          const control =
            matchedUni?.schoolType ||
            matchedStored?.schoolType ||
            collegeData?.school_type ||
            collegeData?.control ||
            overviewData?.school?.control ||
            "Public";
          const isPrivate = String(control).toLowerCase().includes("private");

          const state =
            matchedUni?.state ||
            matchedStored?.state ||
            collegeData?.state ||
            overviewData?.school?.state ||
            "";
          const city =
            matchedUni?.city ||
            matchedStored?.city ||
            collegeData?.city ||
            overviewData?.school?.city ||
            "";

          const rawUrl =
            collegeData?.school_url ||
            overviewData?.school?.school_url ||
            overviewData?.school_url ||
            "";
          let website = "";
          if (rawUrl && String(rawUrl).trim()) {
            const trimmedUrl = String(rawUrl).trim();
            website = trimmedUrl.startsWith("http")
              ? trimmedUrl
              : `https://${trimmedUrl}`;
          }

          let logo = "";
          if (website) {
            try {
              logo = `https://logo.clearbit.com/${new URL(website).hostname}`;
            } catch {
              logo = "";
            }
          }

          const tuitionInState = toNum(tuitionData?.tuition?.tuition_in_state);
          const tuitionOutOfState = toNum(
            tuitionData?.tuition?.tuition_out_state,
          );
          const acceptanceRate = toNum(
            overviewData?.admissions?.admission_rate,
          );

          const satRwMin = toNum(overviewData?.admissions?.sat_rw_min);
          const satMathMin = toNum(overviewData?.admissions?.sat_math_min);
          const satMin =
            satRwMin !== null && satMathMin !== null
              ? satRwMin + satMathMin
              : null;

          const satRwMax = toNum(overviewData?.admissions?.sat_rw_max);
          const satMathMax = toNum(overviewData?.admissions?.sat_math_max);
          const satMax =
            satRwMax !== null && satMathMax !== null
              ? satRwMax + satMathMax
              : null;

          const completionRate = toNum(
            overviewData?.completion?.completion_rate,
          );
          const graduationRate =
            completionRate !== null ? completionRate / 100 : null;

          const medianSalary =
            sanitizeSalary(outcomesData?.earnings?.year_10) ??
            sanitizeSalary(overviewData?.earnings?.year_10) ??
            null;

          const studentPopulation = toNum(overviewData?.students?.size);

          cacheUniversity({
            unitid,
            school_name: name,
            city,
            state,
            school_type: control,
          });

          return {
            id: entryId,
            unitid,
            name,
            shortName: name
              .replace("University", "")
              .replace("Institute of Technology", "")
              .trim(),
            logo,
            state,
            location:
              city && state ? `${city}, ${state}` : city || state || "Unknown",
            isPrivate,
            tuitionInState,
            tuitionOutOfState,
            acceptanceRate,
            satMin,
            satMax,
            graduationRate,
            medianSalary,
            studentPopulation,
            image:
              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
            website,
            schoolUrl: website || undefined,
            cipCode,
            programName: programName || undefined,
            credentialTitle: credentialTitle || undefined,
          } as College;
        });

        const resolvedColleges = await Promise.all(fetchPromises);
        if (cancelled) return;

        const filteredColleges = resolvedColleges.filter(Boolean) as College[];
        setComparedColleges(filteredColleges);

        // The shared cross-app mirror (read by CompareDeck, search cards, the
        // profile section) only ever holds one row per unitid — dedupe here
        // so a college compared under two programs doesn't write two rows
        // with the same id into it.
        const seenUnitids = new Set<string>();
        const detailsList: StoredDetail[] = [];
        for (const c of filteredColleges) {
          if (seenUnitids.has(c.unitid)) continue;
          seenUnitids.add(c.unitid);
          detailsList.push({
            id: c.unitid,
            name: c.name,
            logo: c.logo,
            logoColor: "bg-blue-600",
            location: c.location,
            city:
              c.location && c.location.includes(",")
                ? c.location.split(",")[0].trim()
                : "",
            state: c.state,
            schoolType: c.isPrivate ? "Private" : "Public",
            cipCode: c.cipCode || "default",
            programName: c.programName || "",
            schoolUrl: c.schoolUrl || "",
          });
        }
        localStorage.setItem(
          "compared_colleges_details",
          JSON.stringify(detailsList),
        );
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

  // Comparison metrics for highlighting winners.
  const highlights = useMemo(() => {
    const defaultVal = {
      lowestTuitionId: "",
      highestGraduationId: "",
      highestSalaryId: "",
      bestValueId: "",
    };

    if (comparedColleges.length <= 1) return defaultVal;

    const values = {
      lowestTuition: Infinity,
      lowestTuitionId: "",
      highestGraduation: -Infinity,
      highestGraduationId: "",
      highestSalary: -Infinity,
      highestSalaryId: "",
      bestValue: -Infinity,
      bestValueId: "",
    };

    const tuitionValues: number[] = [];
    const graduationValues: number[] = [];
    const salaryValues: number[] = [];
    const valueRatioValues: number[] = [];

    comparedColleges.forEach((c) => {
      const tuition = c.tuitionOutOfState;
      if (tuition !== null) {
        tuitionValues.push(tuition);
        if (tuition < values.lowestTuition) {
          values.lowestTuition = tuition;
          values.lowestTuitionId = c.id;
        }
      }

      if (c.graduationRate !== null) {
        graduationValues.push(c.graduationRate);
        if (c.graduationRate > values.highestGraduation) {
          values.highestGraduation = c.graduationRate;
          values.highestGraduationId = c.id;
        }
      }

      if (c.medianSalary !== null) {
        salaryValues.push(c.medianSalary);
        if (c.medianSalary > values.highestSalary) {
          values.highestSalary = c.medianSalary;
          values.highestSalaryId = c.id;
        }
      }

      if (c.medianSalary !== null && tuition !== null) {
        const valueRatio = c.medianSalary / (tuition || 1);
        valueRatioValues.push(valueRatio);
        if (valueRatio > values.bestValue) {
          values.bestValue = valueRatio;
          values.bestValueId = c.id;
        }
      }
    });

    const hasTuitionDiff =
      tuitionValues.length > 1 &&
      Math.max(...tuitionValues) !== Math.min(...tuitionValues);
    const hasGradDiff =
      graduationValues.length > 1 &&
      Math.max(...graduationValues) !== Math.min(...graduationValues);
    const hasSalaryDiff =
      salaryValues.length > 1 &&
      Math.max(...salaryValues) !== Math.min(...salaryValues);
    const hasValueRatioDiff =
      valueRatioValues.length > 1 &&
      Math.max(...valueRatioValues) !== Math.min(...valueRatioValues);

    return {
      lowestTuitionId: hasTuitionDiff ? values.lowestTuitionId : "",
      highestGraduationId: hasGradDiff ? values.highestGraduationId : "",
      highestSalaryId: hasSalaryDiff ? values.highestSalaryId : "",
      bestValueId: hasValueRatioDiff ? values.bestValueId : "",
    };
  }, [comparedColleges]);

  // Averages for lower/higher calculations.
  const averages = useMemo(() => {
    if (comparedColleges.length === 0)
      return { tuition: 0, graduationRate: 0, medianSalary: 0 };

    const tuitionColleges = comparedColleges.filter(
      (c) => c.tuitionOutOfState !== null,
    );
    const gradColleges = comparedColleges.filter(
      (c) => c.graduationRate !== null,
    );
    const salaryColleges = comparedColleges.filter(
      (c) => c.medianSalary !== null,
    );

    const sumTuition = tuitionColleges.reduce(
      (s, c) => s + (c.tuitionOutOfState ?? 0),
      0,
    );
    const sumGraduation = gradColleges.reduce(
      (s, c) => s + (c.graduationRate ?? 0),
      0,
    );
    const sumSalary = salaryColleges.reduce(
      (s, c) => s + (c.medianSalary ?? 0),
      0,
    );

    return {
      tuition:
        tuitionColleges.length > 0 ? sumTuition / tuitionColleges.length : 0,
      graduationRate:
        gradColleges.length > 0 ? sumGraduation / gradColleges.length : 0,
      medianSalary:
        salaryColleges.length > 0 ? sumSalary / salaryColleges.length : 0,
    };
  }, [comparedColleges]);

  const handleAddCollege = (
    id: string,
    program?: {
      cipCode: string;
      programName: string;
      credentialTitle?: string;
      credentialLevel?: number | string;
    },
  ) => {
    if (comparedIds.length >= 5) {
      setIsLimitModalOpen(true);
      return;
    }

    const cipCode = program?.cipCode || "default";
    // Same college + same course + same credential level → same entryId, so
    // this naturally blocks an exact duplicate. Same course under a
    // different credential level (e.g. Bachelor's vs Master's) gets a
    // distinct entryId and is allowed.
    const entryId = makeEntryId(id, cipCode, program?.credentialLevel);
    if (comparedIds.includes(entryId)) return;

    if (program?.programName) {
      const map = readEntryPrograms();
      map[entryId] = {
        programName: program.programName,
        credentialTitle: program.credentialTitle || "",
      };
      writeEntryPrograms(map);
    }

    const opt =
      allUniversitiesRef.current.get(String(id)) ||
      selectOptions.find((u) => u.id === id) ||
      initialUniversities.find((u) => u.id === id);

    // Update the matrix view (URL) and delegate the college-level selection
    // to the shared store, which owns the backend set + localStorage mirror.
    // The shared store is keyed by unitid alone (one row per college) — it's
    // a no-op ("exists") when this college is already tracked there, e.g.
    // because we're adding a second program for it.
    syncUrlParams([...comparedIds, entryId]);
    addToCompare({
      id: String(id),
      name: opt?.name,
      city: opt?.city || "",
      state: opt?.state || "",
      schoolType: opt?.schoolType || "Public",
      location:
        opt?.city && opt?.state
          ? `${opt.city}, ${opt.state}`
          : opt?.city || opt?.state || "",
      cipCode,
      programName: program?.programName || undefined,
    })
      .then((res) => {
        if (res === "full") setIsLimitModalOpen(true);
      })
      .catch((err) =>
        console.error("Failed to sync comparison selection:", err),
      );
  };

  const handleRemoveCollege = (entryId: string) => {
    const remaining = comparedIds.filter((cid) => cid !== entryId);
    syncUrlParams(remaining);

    const map = readEntryPrograms();
    if (entryId in map) {
      delete map[entryId];
      writeEntryPrograms(map);
    }

    // Only drop the college from the shared cross-app store once every entry
    // for it has been removed from this matrix — another program for the
    // same college may still be compared.
    const { unitid } = parseEntryId(entryId);
    const stillPresent = remaining.some(
      (cid) => parseEntryId(cid).unitid === unitid,
    );
    if (!stillPresent) {
      removeFromCompare(unitid).catch((err) =>
        console.error("Failed to sync comparison selection:", err),
      );
    }
  };

  const handleClearAll = () => {
    syncUrlParams([]);
    writeEntryPrograms({});
    clearCompare().catch((err) =>
      console.error("Failed to sync comparison selection:", err),
    );
  };

  return {
    comparedIds,
    comparedColleges,
    selectOptions,
    initialUniversities,
    isSearching,
    isDetailsLoading,
    isLimitModalOpen,
    setIsLimitModalOpen,
    activeModalId,
    setActiveModalId,
    collegeDetailsCache,
    setCollegeDetailsCache,
    averages,
    highlights,
    handleDropdownSearch,
    handleAddCollege,
    handleRemoveCollege,
    handleClearAll,
    MIN_SEARCH_CHARS,
  };
}
