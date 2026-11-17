'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Base Skeleton primitive with pulsing shimmer */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
};

/** Skeleton for Top Header Banner */
export const SkeletonHeaderBanner: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

/** Skeleton for Table / List View */
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="border border-slate-200/80 dark:border-border rounded-3xl bg-white dark:bg-card shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-10 w-72 rounded-2xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Table Head */}
      <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-accent/30 border-b border-slate-100 dark:border-border grid grid-cols-12 gap-4">
        <Skeleton className="h-4 col-span-5 rounded" />
        <Skeleton className="h-4 col-span-2 rounded" />
        <Skeleton className="h-4 col-span-2 rounded" />
        <Skeleton className="h-4 col-span-3 rounded" />
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-100 dark:divide-border/60">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-5 flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="col-span-2">
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="col-span-3 flex items-center justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Product Studio Dedicated Skeleton */
export const ProductStudioSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SkeletonHeaderBanner />

      {/* Quick Metrics & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      <SkeletonTable rows={7} />
    </div>
  );
};

/** Taxonomy Studio (Categories, Brands, Collections) Skeleton */
export const TaxonomyStudioSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SkeletonHeaderBanner />

      {/* Tabs & Search Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-64 rounded-2xl" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3.5 w-4/5 rounded" />
              <div className="pt-3 border-t border-slate-100 dark:border-border flex items-center justify-between">
                <Skeleton className="h-3 w-20 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="w-7 h-7 rounded-lg" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Orders Studio Dedicated Skeleton */
export const OrderStudioSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SkeletonHeaderBanner />

      {/* Pipeline Stages Strip */}
      <div className="p-4 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs flex items-center gap-2 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full shrink-0" />
        ))}
      </div>

      <SkeletonTable rows={8} />
    </div>
  );
};

/** Dashboard Overview Dedicated Skeleton */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-3">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-9 w-80 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* 8 Store KPI Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="w-6 h-6 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Chart & Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-xs space-y-4">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-accent/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-36 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
