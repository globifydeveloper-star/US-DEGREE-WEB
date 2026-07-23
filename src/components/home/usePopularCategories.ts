"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { fetchPopularCategories } from "@/lib/home/popularCategoriesApi";
import {
  PopularCategoriesSource,
  PopularCategory,
} from "@/types/home/PopularCategory";
import { DEFAULT_CATEGORIES } from "./defaultCategories";

interface FetchedCategories {
  categories: PopularCategory[];
  source: PopularCategoriesSource;
  showCompletePrompt: boolean;
}

export function usePopularCategories() {
  // `loading` gates the fetch below until Firebase has resolved whether
  // there's a user at all; `user` re-triggers the fetch on login/logout.
  const { user, loading: authLoading } = useAuth();
  const [fetched, setFetched] = useState<FetchedCategories | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Logged-out visitors have nothing to personalize — skip the network
    // call entirely rather than round-tripping to
    // /popular-categories/personalized for an anonymous "default" response.
    // The static set is served below, derived at render time.
    if (authLoading || !user) return;

    let cancelled = false;

    (async () => {
      try {
        setIsFetching(true);
        const response = await fetchPopularCategories();
        if (cancelled) return;

        setFetched(response);
        setError(null);
        trackEvent("home_categories_source", { source: response.source });
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching popular categories:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return {
      categories: [],
      source: null,
      showCompletePrompt: false,
      isLoading: true,
      error: null,
      isStaticDefault: false,
    };
  }

  if (!user) {
    return {
      categories: DEFAULT_CATEGORIES,
      source: "default" as const,
      showCompletePrompt: false,
      isLoading: false,
      error: null,
      isStaticDefault: true,
    };
  }

  return {
    categories: fetched?.categories ?? [],
    source: fetched?.source ?? null,
    showCompletePrompt: fetched?.showCompletePrompt ?? false,
    isLoading: isFetching,
    error,
    isStaticDefault: false,
  };
}
