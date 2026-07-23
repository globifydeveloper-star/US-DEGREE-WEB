"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { fetchPopularCategories } from "@/lib/home/popularCategoriesApi";
import {
  PopularCategoriesSource,
  PopularCategory,
} from "@/types/home/PopularCategory";

export function usePopularCategories() {
  // Only used to know *when* auth state changes so we refetch (e.g. right
  // after login) — the id itself is never sent to fetchPopularCategories,
  // which resolves the user from the app JWT on the backend.
  const { user } = useAuth();
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [source, setSource] = useState<PopularCategoriesSource | null>(null);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        const response = await fetchPopularCategories();
        if (cancelled) return;

        setCategories(response.categories);
        setSource(response.source);
        setShowCompletePrompt(response.showCompletePrompt);
        setError(null);
        trackEvent("home_categories_source", { source: response.source });
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching popular categories:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { categories, source, showCompletePrompt, isLoading, error };
}
