"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import CategoriesHeader from "./CategoriesHeader";
import CategoryCarousel, { hasMoreThanPreview } from "./CategoryCarousel";
import CategoryGrid from "./CategoryGrid";
import CompleteMatchPreferencesCard from "./CompleteMatchPreferencesCard";
import PopularCategoriesSkeleton from "./PopularCategoriesSkeleton";
import StateRelaxedNote from "./StateRelaxedNote";
import { usePopularCategories } from "./usePopularCategories";

export default function Categories() {
  const { categories, source, showCompletePrompt, isLoading, error } =
    usePopularCategories();
  const [showAll, setShowAll] = useState(false);

  const hasContent = !isLoading && !error && categories.length > 0;
  const canToggleView =
    hasContent && (hasMoreThanPreview(categories) || showAll);

  return (
    <section className="px-4 sm:px-10 lg:px-[86px] py-12 sm:py-16 flex justify-center">
      <div className="w-full max-w-[2380px]">
        <CategoriesHeader
          showToggle={canToggleView}
          showAll={showAll}
          onToggle={() => setShowAll((prev) => !prev)}
        />

        {isLoading && <PopularCategoriesSkeleton />}

        {!isLoading && error && (
          <EmptyState
            title="Couldn't load categories"
            description="Something went wrong loading popular categories. Please try again shortly."
            icon={AlertCircle}
          />
        )}

        {!isLoading && !error && categories.length === 0 && (
          <EmptyState
            title="No categories to show"
            description="Check back soon — we're adding new fields of study regularly."
          />
        )}

        {hasContent && (
          <>
            {/* Both banners are personalization states — logged-out and
                just-logged-in-without-preferences users see neither, only
                the plain default category set below. */}
            {showCompletePrompt && <CompleteMatchPreferencesCard />}
            {source === "personalized_state_relaxed" && <StateRelaxedNote />}

            {showAll ? (
              <CategoryGrid categories={categories} />
            ) : (
              <CategoryCarousel categories={categories} />
            )}
          </>
        )}
      </div>
    </section>
  );
}
