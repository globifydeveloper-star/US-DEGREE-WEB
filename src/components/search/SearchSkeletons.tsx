import React from "react";

/**
 * Skeleton that mimics the ResultCard layout (list view).
 */
export function ResultCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm animate-pulse">
      {/* Header: logo + name/location */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Degree title */}
      <div className="h-3.5 w-64 bg-gray-200 rounded mb-3" />

      {/* Stat pills row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="h-6 w-16 bg-gray-200 rounded-md" />
        <div className="h-6 w-20 bg-gray-200 rounded-md" />
        <div className="h-6 w-28 bg-gray-200 rounded-md" />
      </div>

      {/* Stat tiles */}
      <div className="flex flex-wrap gap-3 py-4 border-y border-gray-100 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px] flex-1"
          >
            <div className="h-2.5 w-14 bg-gray-200 rounded mb-2" />
            <div className="h-3.5 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-16 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded-full" />
          <div className="h-8 w-28 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton that mimics the TileCard layout (grid view).
 */
export function TileCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 animate-pulse">
      {/* Header: logo + name */}
      <div className="flex items-start gap-2">
        <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3.5 w-4/5 bg-gray-200 rounded mb-1.5" />
          <div className="h-2.5 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Badge */}
      <div className="h-5 w-16 bg-gray-200 rounded-full" />

      {/* Degree */}
      <div className="h-3 w-3/4 bg-gray-200 rounded" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-2 w-12 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div className="h-8 w-full bg-gray-200 rounded-full mt-auto" />
    </div>
  );
}

/**
 * Renders multiple ResultCard skeletons (list view loading).
 */
export function ResultListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ResultCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Renders multiple TileCard skeletons (grid view loading).
 */
export function TileGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TileCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for the SearchHeader area (breadcrumbs + title + sort).
 */
export function SearchHeaderSkeleton() {
  return (
    <div className="w-full mb-8 animate-pulse">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-10 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="h-7 w-72 bg-gray-200 rounded mb-2" />
          <div className="h-3.5 w-56 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 bg-gray-200 rounded-lg" />
          <div className="h-8 w-44 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the sidebar filter sections.
 */
export function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Degree Level section */}
      <div>
        <div className="h-3 w-20 bg-gray-200 rounded mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded shrink-0" />
              <div
                className="h-3 bg-gray-200 rounded"
                style={{ width: 100 + i * 15 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Institution Type section */}
      <div>
        <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
        <div className="h-9 w-full bg-gray-200 rounded-full" />
      </div>

      {/* State section */}
      <div>
        <div className="h-3 w-10 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-full bg-gray-200 rounded-lg mb-3" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded shrink-0" />
              <div
                className="h-3 bg-gray-200 rounded"
                style={{ width: 60 + i * 12 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
