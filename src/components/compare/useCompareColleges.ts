import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";
import type { CollegeDetail } from "@/types/university/ComparisonTable";
import {
  MAX_COMPARE,
  addCollegeToCompare,
  removeCollegeFromCompare,
  clearCompare,
  reloadMatrix,
  getCompareEntryIds,
} from "./compareMatrixStore";
import { makeEntryId, parseEntryId } from "./compareEntryIds";
import { useCollegeSearch, MIN_SEARCH_CHARS } from "./useCollegeSearch";
import { useCompareDetailsFetch } from "./useCompareDetailsFetch";
import { useCompareHighlights } from "./useCompareHighlights";
import { MATRIX_OWNER_CHANGED_EVENT } from "@/hooks/useCompareCount";

import { ServerCompareBundle } from "@/lib/compare/compareServer";

export type { UniOption } from "./compareCollegeTypes";
export { parseEntryId };

export function useCompareColleges(initialBundle?: ServerCompareBundle) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- comparedIds is DERIVED from the URL (single source of truth) ----
  const idsParam = searchParams.get("ids");
  const comparedIds = useMemo<string[]>(
    () =>
      (idsParam
        ? idsParam.split(",").filter(Boolean)
        : initialBundle?.comparedIds || []
      ).slice(0, MAX_COMPARE),
    [idsParam, initialBundle?.comparedIds],
  );

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
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

  const { comparedColleges, isDetailsLoading, seedComparedDetails } =
    useCompareDetailsFetch(
      comparedIds,
      { allUniversitiesRef, cacheUniversity },
      initialBundle?.comparedColleges,
    );

  const { highlights, averages } = useCompareHighlights(comparedColleges);

  // Hydrate the URL on first mount (one-time). The backend's persisted
  // matrix (/compare/matrix, via compareMatrixStore) is the durable source of
  // truth — localStorage is only a fast local mirror that can be empty/stale
  // on a fresh device or after a fresh login, which is exactly when this
  // matters.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    let cancelled = false;

    // React 18 Strict Mode (dev only) mounts, cleans up, then re-mounts every
    // effect once to surface exactly this class of bug. Without resetting the
    // ref here, the throwaway first mount permanently marks hydration "done"
    // before its own async work (which the cleanup below cancels) ever
    // reaches reloadMatrix()/router.replace — so the real second mount sees
    // hydratedRef already true and skips running entirely.
    const resetHydratedRef = () => {
      hydratedRef.current = false;
    };

    if (idsParam) {
      // A URL already names specific entries (e.g. a shared compare link, or
      // returning from syncUrlParams below) — nothing to hydrate.
      return () => {
        cancelled = true;
        resetHydratedRef();
      };
    }

    // No ids in the URL (e.g. the plain "/compare" nav link). Reconcile with
    // the backend's persisted matrix — reloadMatrix() forces a fresh fetch
    // rather than trusting a `loaded` cache some other mounted component
    // (e.g. a search card's useIsCollegeCompared) may have already set from
    // an earlier, possibly-stale snapshot.
    (async () => {
      try {
        await reloadMatrix();
        if (cancelled) return;
        const ids = getCompareEntryIds();
        if (ids.length > 0) {
          const params = new URLSearchParams();
          params.set("ids", ids.slice(0, MAX_COMPARE).join(","));
          router.replace(`/compare?${params.toString()}`);
        }
      } catch (e) {
        console.error("Failed to load compare matrix:", e);
      }
    })();

    return () => {
      cancelled = true;
      resetHydratedRef();
    };
  }, [idsParam, router]);

  // React to a sign-in/sign-out/account-switch (compareMatrixStore's
  // syncCompareMatrixOwner). The URL's `ids` param can still be naming
  // entries picked while signed out on the now-public /compare page — e.g.
  // login happens via a modal with no navigation, so that URL survives the
  // login untouched. On an owner change, re-derive `ids` from the backend's
  // matrix for whoever is signed in now (empty if signed out), discarding
  // whatever was in the URL rather than merging it in.
  useEffect(() => {
    const handleOwnerChanged = () => {
      (async () => {
        try {
          await reloadMatrix();
          const ids = getCompareEntryIds().slice(0, MAX_COMPARE);
          const params = new URLSearchParams();
          if (ids.length > 0) params.set("ids", ids.join(","));
          router.replace(`/compare${ids.length > 0 ? `?${params.toString()}` : ""}`);
        } catch (e) {
          console.error("Failed to reload compare matrix after sign-in:", e);
        }
      })();
    };
    window.addEventListener(MATRIX_OWNER_CHANGED_EVENT, handleOwnerChanged);
    return () =>
      window.removeEventListener(MATRIX_OWNER_CHANGED_EVENT, handleOwnerChanged);
  }, [router]);

  // Keep the URL query param synchronised with the active compared IDs. The
  // matrix itself (localStorage mirror + backend persistence) is already
  // handled by compareMatrixStore's add/remove/clear calls below — this only
  // owns the page's own shareable-link concern.
  const syncUrlParams = useCallback(
    (ids: string[]) => {
      const capped = ids.slice(0, MAX_COMPARE);
      const params = new URLSearchParams();
      if (capped.length > 0) {
        params.set("ids", capped.join(","));
      }
      router.push(`/compare?${params.toString()}`);
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
      name?: string;
      location?: string;
    },
  ) => {
    if (comparedIds.length >= MAX_COMPARE) {
      setIsLimitModalOpen(true);
      return;
    }
    const cipCode = program?.cipCode || "default";
    addCollegeToCompare({
      unitid: id,
      cipCode,
      credentialLevel: program?.credentialLevel,
      programName: program?.programName,
      credentialTitle: program?.credentialTitle,
      name: program?.name,
      location: program?.location,
    })
      .then((result) => {
        if (result === "full") {
          setIsLimitModalOpen(true);
          return;
        }
        if (result === "exists") {
          message.warning("This program is already added to comparison");
          return;
        }
        if (result !== "added") return;
        // Same college + same course + same credential level → same entryId,
        // so an exact duplicate is already blocked ("exists") above. Same
        // course under a different credential level (e.g. Bachelor's vs
        // Master's) gets a distinct entryId and is allowed.
        const entryId = makeEntryId(id, cipCode, program?.credentialLevel);
        syncUrlParams([...comparedIds, entryId].slice(0, MAX_COMPARE));
      })
      .catch((err) =>
        console.error("Failed to sync comparison selection:", err),
      );
  };

  const handleRemoveCollege = (entryId: string) => {
    // Guard against the delete button being clicked again before the first
    // request (and the URL/details update that follows it) has landed.
    if (removingIds.has(entryId)) return;
    setRemovingIds((prev) => new Set(prev).add(entryId));

    const { unitid, cipCode, credentialLevel } = parseEntryId(entryId);
    removeCollegeFromCompare(unitid, {
      ...(cipCode !== "default" ? { cipCode, credentialLevel } : {}),
      withDetails: true,
    })
      .then((result) => {
        if (result) {
          // Already-enriched rows for what's left — render them straight
          // away instead of waiting on a separate /compare/matrix/details
          // fetch triggered by the URL change below.
          seedComparedDetails(result.ids, result.details);
          syncUrlParams(result.ids);
          return;
        }
        syncUrlParams(comparedIds.filter((cid) => cid !== entryId));
      })
      .catch((err) =>
        console.error("Failed to sync comparison selection:", err),
      )
      .finally(() => {
        setRemovingIds((prev) => {
          if (!prev.has(entryId)) return prev;
          const next = new Set(prev);
          next.delete(entryId);
          return next;
        });
      });
  };

  const handleClearAll = () => {
    setIsClearingAll(true);
    clearCompare()
      .then(() => syncUrlParams([]))
      .catch((err) =>
        console.error("Failed to sync comparison selection:", err),
      )
      .finally(() => setIsClearingAll(false));
  };

  return {
    comparedIds,
    comparedColleges,
    selectOptions,
    initialUniversities,
    isSearching,
    isDetailsLoading,
    isLimitModalOpen,
    isClearingAll,
    removingIds,
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
    MAX_COMPARE,
  };
}
