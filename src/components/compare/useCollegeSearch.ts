import { useCallback, useEffect, useRef, useState } from "react";
import { authedFetch, hasAuthenticatedUser } from "@/lib/auth/api";
import type { RawUniversity, UniOption } from "./compareCollegeTypes";

const INITIAL_LIST_SIZE = 20;
export const MIN_SEARCH_CHARS = 4;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Backs the compare page's "add a college" dropdown: preloads an initial
 * list from /compare/colleges, then runs a debounced server-side search as
 * the user types. Also caches every college seen so far (by unitid) so other
 * hooks can resolve a college's name/location without a second fetch.
 */
export function useCollegeSearch(handle401: (status: number) => boolean) {
  const [selectOptions, setSelectOptions] = useState<UniOption[]>([]);
  // Rendered in the "Quick Add" list, so this is state (not a ref).
  const [initialUniversities, setInitialUniversities] = useState<UniOption[]>(
    [],
  );
  // Cache of EVERY college we have loaded. Used to resolve names/locations.
  const allUniversitiesRef = useRef<Map<string, UniOption>>(new Map());
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Normalise one raw API university row into a UniOption and cache it.
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

  // Preload the initial dropdown list from /compare/colleges (returns up to 50).
  useEffect(() => {
    const fetchUniversities = async () => {
      // /compare/colleges is user-scoped and requires a signed-in session —
      // compare itself is public now, so an anonymous visitor simply skips
      // this preload rather than getting bounced to login by its 401.
      if (!(await hasAuthenticatedUser())) return;
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

  // Debounced SERVER-SIDE search against the full DB via /compare/colleges?search=...
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
        if (!(await hasAuthenticatedUser())) {
          setIsSearching(false);
          return;
        }
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

  return {
    selectOptions,
    initialUniversities,
    isSearching,
    allUniversitiesRef,
    cacheUniversity,
    handleDropdownSearch,
  };
}
