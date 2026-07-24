import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CollegeDetail } from "@/types/university/ComparisonTable";
import {
  addToCompare,
  removeFromCompare,
  clearCompare,
} from "@/components/search/useCompareSelected";
import { fetchCompareMatrix, saveCompareMatrix } from "@/lib/auth/api";
import {
  makeEntryId,
  parseEntryId,
  mergeCompareEntryIds,
  matrixEntryIdsToApi,
  apiEntriesToMatrixIds,
  apiEntriesToPrograms,
  readEntryPrograms,
  writeEntryPrograms,
  writeMatrixEntries,
} from "./compareEntryIds";
import { useCollegeSearch, MIN_SEARCH_CHARS } from "./useCollegeSearch";
import { useCompareDetailsFetch } from "./useCompareDetailsFetch";
import { useCompareHighlights } from "./useCompareHighlights";

export type { UniOption } from "./compareCollegeTypes";
export { parseEntryId, mergeCompareEntryIds };

const MAX_COMPARE_ENTRIES = 5;

export function useCompareColleges() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- comparedIds is DERIVED from the URL (single source of truth) ----
  const idsParam = searchParams.get("ids");
  const comparedIds = useMemo<string[]>(
    () => (idsParam ? idsParam.split(",").filter(Boolean) : []),
    [idsParam],
  );

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

  const {
    selectOptions,
    initialUniversities,
    isSearching,
    allUniversitiesRef,
    cacheUniversity,
    handleDropdownSearch,
  } = useCollegeSearch(handle401);

  const { comparedColleges, isDetailsLoading } = useCompareDetailsFetch(
    comparedIds,
    { allUniversitiesRef, cacheUniversity },
  );

  const { highlights, averages } = useCompareHighlights(comparedColleges);

  // Hydrate the URL on first mount (one-time). The backend's persisted
  // matrix (/compare/matrix) is the durable source of truth for program info
  // — localStorage is only a fast local mirror that can be empty/stale on a
  // fresh device or after a fresh login, which is exactly when this matters.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    let cancelled = false;

    if (idsParam) {
      // Keep the badge's entry-level mirror in sync with whatever the URL
      // says on load. Deliberately NOT written to the shared "compared_colleges"
      // key — that one is college-level (bare unitids) and is exclusively
      // maintained by the addToCompare/removeFromCompare calls in
      // handleAddCollege/handleRemoveCollege below; writing composite entry
      // ids into it would break other consumers (e.g. CompareDeck) that match
      // on bare unitid.
      writeMatrixEntries(idsParam.split(",").filter(Boolean));
      // Backfill program names/cip codes from the backend in case this URL
      // was opened on a device/session whose localStorage never saw them
      // (e.g. a shared compare link, or login on a new browser).
      fetchCompareMatrix()
        .then((entries) => {
          if (cancelled || entries.length === 0) return;
          const backendPrograms = apiEntriesToPrograms(entries);
          const localPrograms = readEntryPrograms();
          writeEntryPrograms({ ...backendPrograms, ...localPrograms });
        })
        .catch((e) => console.error("Failed to backfill compare matrix:", e));
      return () => {
        cancelled = true;
      };
    }

    // No ids in the URL (e.g. the plain "/compare" nav link). Prefer the
    // backend's persisted matrix so program info survives a fresh login;
    // fall back to the local merge (bucket + localStorage matrix) if the
    // backend has nothing yet, e.g. colleges added before this endpoint
    // existed, or while offline.
    (async () => {
      try {
        const backendEntries = await fetchCompareMatrix();
        if (cancelled) return;
        let ids: string[];
        if (backendEntries.length > 0) {
          ids = apiEntriesToMatrixIds(backendEntries);
          writeMatrixEntries(ids);
          writeEntryPrograms({
            ...apiEntriesToPrograms(backendEntries),
            ...readEntryPrograms(),
          });
        } else {
          ids = mergeCompareEntryIds();
        }
        if (ids.length > 0) {
          const params = new URLSearchParams();
          params.set("ids", ids.join(","));
          router.replace(`/compare?${params.toString()}`);
        }
      } catch (e) {
        console.error("Failed to load compare matrix, falling back to local:", e);
        try {
          const ids = mergeCompareEntryIds();
          if (ids.length > 0) {
            const params = new URLSearchParams();
            params.set("ids", ids.join(","));
            router.replace(`/compare?${params.toString()}`);
          }
        } catch (e2) {
          console.error(e2);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idsParam, router]);

  // Keep URL query param synchronised with active compared IDs, mirror the
  // entry-level list into the nav badge's local key, and persist the matrix
  // (with program info) to the backend so it survives a fresh login.
  const syncUrlParams = useCallback(
    (ids: string[]) => {
      const params = new URLSearchParams();
      if (ids.length > 0) {
        params.set("ids", ids.join(","));
      }
      router.push(`/compare?${params.toString()}`);
      writeMatrixEntries(ids);
      saveCompareMatrix(matrixEntryIdsToApi(ids)).catch((err) =>
        console.error("Failed to persist compare matrix:", err),
      );
    },
    [router],
  );

  const handleAddCollege = (
    id: string,
    program?: {
      cipCode: string;
      programName: string;
      credentialTitle?: string;
      credentialLevel?: number | string;
    },
  ) => {
    if (comparedIds.length >= MAX_COMPARE_ENTRIES) {
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
