"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  fetchCourseOptions,
  fetchCredentialOptions,
  fetchStateOptions,
  SelectOption,
} from "@/lib/home/heroSearchApi";

export function useHeroSearch() {
  const router = useRouter();

  const [levels, setLevels] = useState<SelectOption[]>([]);
  const [states, setStates] = useState<SelectOption[]>([]);
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);

  // Once a course is chosen, the state dropdown is narrowed to only the
  // states that actually offer that (level, course) combination — null means
  // "no narrowing yet, show every state". The backend's /states endpoint
  // doesn't support filtering, so this is derived client-side from /courses
  // (which does filter by credential_title + state) and cached per combo so
  // re-selecting the same course doesn't re-fetch.
  const [availableStates, setAvailableStates] = useState<SelectOption[] | null>(
    null,
  );
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const stateAvailabilityCache = useRef<Map<string, SelectOption[]>>(new Map());
  const availabilityRequestId = useRef(0);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const stateOptions = await fetchStateOptions();
        if (stateOptions) setStates(stateOptions);

        const credentialOptions = await fetchCredentialOptions();
        if (credentialOptions) setLevels(credentialOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  const fetchCourses = useCallback(
    async (level: string | null, state: string | null) => {
      setIsCoursesLoading(true);

      try {
        const courseOptions = await fetchCourseOptions(level, state);
        if (courseOptions) {
          setCourses(courseOptions);
          // Only drop the current course if it isn't actually offered under
          // the new level/state — a state chosen from the already-narrowed
          // list (see computeAvailableStates) will always still have it.
          setSelectedCourse((current) =>
            current && courseOptions.some((option) => option.value === current)
              ? current
              : null,
          );
        } else {
          setSelectedCourse(null);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setSelectedCourse(null);
      } finally {
        setIsCoursesLoading(false);
      }
    },
    [],
  );

  // Courses depend on the chosen level/state — react to the change event
  // directly rather than via an effect to avoid cascading renders.
  const updateCourses = useCallback(
    (level: string | null, state: string | null) => {
      if (level || state) {
        fetchCourses(level, state);
      } else {
        setCourses([]);
        setSelectedCourse(null);
      }
    },
    [fetchCourses],
  );

  // Derives, for a given (level, course), the subset of `states` that
  // actually offer it — by probing /courses per state (the only filter the
  // backend supports) and keeping the states whose course list contains it.
  // Cached per "level||course" key and cancellable via a request id so a
  // fast follow-up selection wins over a stale in-flight computation.
  const computeAvailableStates = useCallback(
    async (
      level: string | null,
      course: string | null,
    ): Promise<SelectOption[] | null> => {
      if (!course) {
        setAvailableStates(null);
        setIsStatesLoading(false);
        return null;
      }

      const cacheKey = `${level ?? ""}||${course}`;
      const cached = stateAvailabilityCache.current.get(cacheKey);
      if (cached) {
        setAvailableStates(cached);
        return cached;
      }

      const requestId = ++availabilityRequestId.current;
      setIsStatesLoading(true);

      try {
        const results = await Promise.all(
          states.map(async (state) => {
            try {
              const courseOptions = await fetchCourseOptions(level, state.value);
              const hasCourse = (courseOptions ?? []).some(
                (option) => option.value === course,
              );
              return hasCourse ? state : null;
            } catch {
              return null;
            }
          }),
        );

        if (requestId !== availabilityRequestId.current) return null;

        const filtered = results.filter(
          (state): state is SelectOption => state !== null,
        );
        stateAvailabilityCache.current.set(cacheKey, filtered);
        setAvailableStates(filtered);
        return filtered;
      } finally {
        if (requestId === availabilityRequestId.current) {
          setIsStatesLoading(false);
        }
      }
    },
    [states],
  );

  const handleLevelChange = async (value: string | null) => {
    setSelectedLevel(value);
    updateCourses(value, selectedState);
    setAvailableStates(null);

    if (selectedCourse) {
      const filtered = await computeAvailableStates(value, selectedCourse);
      if (
        filtered &&
        selectedState &&
        !filtered.some((state) => state.value === selectedState)
      ) {
        setSelectedState(null);
      }
    }
  };

  const handleStateChange = (value: string | null) => {
    setSelectedState(value);
    updateCourses(selectedLevel, value);
  };

  const handleCourseChange = async (value: string | null) => {
    setSelectedCourse(value);
    const filtered = await computeAvailableStates(selectedLevel, value);
    if (
      filtered &&
      selectedState &&
      !filtered.some((state) => state.value === selectedState)
    ) {
      setSelectedState(null);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append("type", "programs");

    if (selectedLevel) params.append("credential_title", selectedLevel);
    if (selectedState) params.append("state", selectedState);
    if (selectedCourse) params.append("title", selectedCourse);

    router.push(`/search?${params.toString()}`);
  };

  return {
    levels,
    states: availableStates ?? states,
    courses,
    selectedLevel,
    selectedState,
    selectedCourse,
    isLoading,
    isCoursesLoading,
    isStatesLoading,
    setSelectedCourse: handleCourseChange,
    handleLevelChange,
    handleStateChange,
    handleSearch,
  };
}

export type HeroSearchState = ReturnType<typeof useHeroSearch>;
