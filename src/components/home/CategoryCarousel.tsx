import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PopularCategory } from "@/types/home/PopularCategory";
import CategoryCard from "./CategoryCard";

// Row view shows a capped preview; "View all categories" switches to the
// full grid instead (see Categories.tsx).
const ROW_PREVIEW_COUNT = 7;

interface CategoryCarouselProps {
  categories: PopularCategory[];
}

export function hasMoreThanPreview(categories: PopularCategory[]) {
  return categories.length > ROW_PREVIEW_COUNT;
}

export default function CategoryCarousel({
  categories,
}: CategoryCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const previewCategories = categories.slice(0, ROW_PREVIEW_COUNT);
  const hasMore = hasMoreThanPreview(categories);

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {hasMore && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByCards(-1)}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-indigo-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollerRef}
        className="degree-scrollbar flex overflow-x-auto gap-4 sm:gap-6 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory"
      >
        {previewCategories.map((category) => (
          <CategoryCard
            key={`${category.category_id}-${category.sort_order}`}
            category={category}
            fixedWidth
          />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByCards(1)}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:text-indigo-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
