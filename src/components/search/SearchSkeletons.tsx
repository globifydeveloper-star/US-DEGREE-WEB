import React from 'react';
import { Skeleton } from 'antd';

/**
 * Skeleton that mimics the ResultCard layout (list view).
 */
export function ResultCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      {/* Header: logo + name/location */}
      <div className="flex items-start gap-4 mb-4">
        <Skeleton.Avatar active shape="square" size={40} style={{ borderRadius: 8 }} />
        <div className="flex-1">
          <Skeleton.Input active size="small" style={{ width: 200, height: 16, marginBottom: 6 }} />
          <Skeleton.Input active size="small" style={{ width: 120, height: 12 }} />
        </div>
      </div>

      {/* Degree title */}
      <Skeleton.Input active size="small" style={{ width: 260, height: 14, marginBottom: 12 }} />

      {/* Stat pills row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
        <Skeleton.Input active size="small" style={{ width: 70, height: 12 }} />
        <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Skeleton.Button active size="small" style={{ width: 60, height: 24, borderRadius: 6 }} />
        <Skeleton.Button active size="small" style={{ width: 70, height: 24, borderRadius: 6 }} />
        <Skeleton.Button active size="small" style={{ width: 110, height: 24, borderRadius: 6 }} />
      </div>

      {/* Stat tiles */}
      <div className="flex flex-wrap gap-3 py-4 border-y border-gray-100 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 min-w-[90px]">
            <Skeleton.Input active size="small" style={{ width: 60, height: 10, marginBottom: 6 }} />
            <Skeleton.Input active size="small" style={{ width: 50, height: 14 }} />
          </div>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex items-center justify-between">
        <Skeleton.Input active size="small" style={{ width: 70, height: 14 }} />
        <div className="flex gap-2">
          <Skeleton.Button active size="small" style={{ width: 100, height: 30, borderRadius: 9999 }} />
          <Skeleton.Button active size="small" style={{ width: 120, height: 30, borderRadius: 9999 }} />
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
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Header: logo + name */}
      <div className="flex items-start gap-2">
        <Skeleton.Avatar active shape="square" size={36} style={{ borderRadius: 8 }} />
        <div className="flex-1 min-w-0">
          <Skeleton.Input active size="small" style={{ width: '80%', height: 14, marginBottom: 4 }} />
          <Skeleton.Input active size="small" style={{ width: '50%', height: 11 }} />
        </div>
      </div>

      {/* Badge */}
      <Skeleton.Button active size="small" style={{ width: 60, height: 20, borderRadius: 9999 }} />

      {/* Degree */}
      <Skeleton.Input active size="small" style={{ width: '70%', height: 12 }} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <Skeleton.Input active size="small" style={{ width: 50, height: 9, marginBottom: 3 }} />
            <Skeleton.Input active size="small" style={{ width: 45, height: 12 }} />
          </div>
        ))}
      </div>

      {/* CTA button */}
      <Skeleton.Button active block style={{ height: 30, borderRadius: 9999, marginTop: 'auto' }} />
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
    <div className="w-full mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton.Input active size="small" style={{ width: 40, height: 12 }} />
        <Skeleton.Input active size="small" style={{ width: 50, height: 12 }} />
        <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
      </div>
      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <Skeleton.Input active size="medium" style={{ width: 300, height: 28, marginBottom: 8 }} />
          <Skeleton.Input active size="small" style={{ width: 220, height: 14 }} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton.Button active size="small" style={{ width: 70, height: 32, borderRadius: 8 }} />
          <Skeleton.Button active size="small" style={{ width: 180, height: 32, borderRadius: 8 }} />
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
    <div className="flex flex-col gap-6">
      {/* Degree Level section */}
      <div>
        <Skeleton.Input active size="small" style={{ width: 90, height: 12, marginBottom: 16 }} />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton.Avatar active shape="square" size={14} style={{ borderRadius: 3 }} />
              <Skeleton.Input active size="small" style={{ width: 100 + i * 15, height: 13 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Institution Type section */}
      <div>
        <Skeleton.Input active size="small" style={{ width: 110, height: 12, marginBottom: 16 }} />
        <Skeleton.Button active block style={{ height: 36, borderRadius: 20 }} />
      </div>

      {/* State section */}
      <div>
        <Skeleton.Input active size="small" style={{ width: 40, height: 12, marginBottom: 16 }} />
        <Skeleton.Button active block style={{ height: 32, borderRadius: 20, marginBottom: 12 }} />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton.Avatar active shape="square" size={14} style={{ borderRadius: 3 }} />
              <Skeleton.Input active size="small" style={{ width: 60 + i * 12, height: 13 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tuition section */}
      <div>
        <Skeleton.Input active size="small" style={{ width: 100, height: 12, marginBottom: 16 }} />
        <Skeleton.Input active block style={{ height: 6, borderRadius: 3 }} />
      </div>
    </div>
  );
}
