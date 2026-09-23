"use client";

import ResultCard from "./ResultCard";
import TileCard from "./TileCard";
import { mapToCardProps } from "@/lib/search/mapToCardProps";
import { SearchResult, ViewMode } from "@/types/search-details";

interface SearchResultsViewProps {
  viewMode: ViewMode;
  results: SearchResult[];
  error?: boolean;
  onRetry?: () => void;
}

// A last-ditch uniqueness suffix in case unitid+cip+title somehow collides
// (e.g. two rows for the same program that differ only in a field not in
// this key), never the sole identity — see M5 in the frontend fix guide.
const resultKey = (result: SearchResult, i: number) =>
  `${result.unitid}-${result.cip_code ?? ""}-${result.credential_title ?? ""}-${i}`;

export default function SearchResultsView({
  viewMode,
  results,
  error,
  onRetry,
}: SearchResultsViewProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-gray-500">Search failed. Try again.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

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
          <TileCard key={resultKey(result, i)} {...mapToCardProps(result)} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {results.map((result, i) => (
        <ResultCard key={resultKey(result, i)} {...mapToCardProps(result)} />
      ))}
    </div>
  );
}
