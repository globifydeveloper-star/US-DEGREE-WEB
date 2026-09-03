"use client";

import { useSearchParams, useRouter } from "next/navigation";

import TopSearchBar from "@/components/search/TopSearchBar";
import SearchHeader from "@/components/search/SearchHeader";
import SearchSidebar from "@/components/search/SearchSidebar";
import Pagination from "@/components/search/Pagination";
import CompareDeck from "@/components/search/CompareDeck";
import CategoryFilterChip from "@/components/search/CategoryFilterChip";
import SearchResultsView from "@/components/search/SearchResultsView";
import SearchResultsSkeleton from "@/components/search/SearchResultsSkeleton";
import BackToTopButton from "@/components/search/BackToTopButton";
import { useSearchResults } from "@/components/search/useSearchResults";
import { useScrollPastThreshold } from "@/hooks/useScrollPastThreshold";
import { getCategoryLabel } from "@/constants/searchCategories";
import { ServerSearchBundle } from "@/lib/search/searchServer";

const BACK_TO_TOP_THRESHOLD = 400;

interface SearchClientContentProps {
  initialData?: ServerSearchBundle;
}

export default function SearchClientContent({
  initialData,
}: SearchClientContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isLoading,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    totalPages,
    currentResults,
    category,
    pageSize,
    setPageSize,
  } = useSearchResults(initialData);

  const categoryLabel = getCategoryLabel(category);
  const showBackToTop = useScrollPastThreshold(BACK_TO_TOP_THRESHOLD);

  const handleRemoveCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex-1 min-h-[75vh] flex flex-col">
        <TopSearchBar />
        <div className="w-full max-w-[2380px] mx-auto px-6 sm:px-10 lg:px-[86px] py-4 flex flex-col md:flex-row gap-8">
          <SearchSidebar />

          <div className="flex-1 w-full min-w-0">
            {isLoading ? (
              <SearchResultsSkeleton viewMode={viewMode} />
            ) : (
              <>
                {categoryLabel && (
                  <CategoryFilterChip
                    label={categoryLabel}
                    onRemove={handleRemoveCategory}
                  />
                )}
                <SearchHeader view={viewMode} onViewChange={setViewMode} />
                <SearchResultsView
                  viewMode={viewMode}
                  results={currentResults}
                />
              </>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>

      {showBackToTop && <BackToTopButton />}
      <CompareDeck />
    </>
  );
}
