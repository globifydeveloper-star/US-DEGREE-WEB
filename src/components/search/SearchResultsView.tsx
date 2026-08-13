"use client";

import ResultCard from "./ResultCard";
import TileCard from "./TileCard";
import { mapToCardProps } from "@/lib/search/mapToCardProps";
import { SearchResult, ViewMode } from "@/types/search-details";

interface SearchResultsViewProps {
  viewMode: ViewMode;
  results: SearchResult[];
}

export default function SearchResultsView({
  viewMode,
  results,
}: SearchResultsViewProps) {
  if (results.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No results found.
      </p>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((result, i) => (
          <TileCard key={i} {...mapToCardProps(result)} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((result, i) => (
        <ResultCard key={i} {...mapToCardProps(result)} />
      ))}
    </div>
  );
}
