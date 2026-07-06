import {
  ResultListSkeleton,
  TileGridSkeleton,
  SearchHeaderSkeleton,
} from "./SearchSkeletons";
import { ViewMode } from "@/types/search-details";

interface SearchResultsSkeletonProps {
  viewMode: ViewMode;
}

export default function SearchResultsSkeleton({
  viewMode,
}: SearchResultsSkeletonProps) {
  return (
    <>
      <SearchHeaderSkeleton />
      {viewMode === "grid" ? (
        <TileGridSkeleton count={12} />
      ) : (
        <ResultListSkeleton count={5} />
      )}
    </>
  );
}
