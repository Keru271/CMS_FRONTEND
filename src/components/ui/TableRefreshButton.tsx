'use client';

import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

export interface TableRefreshButtonProps {
  onRefresh: () => void | Promise<any>;
  isLoading?: boolean;
  label?: string;
  iconOnly?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const TableRefreshButton: React.FC<TableRefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  label = 'Refresh',
  iconOnly = false,
  className = '',
  size = 'md',
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const activeLoading = isLoading || internalLoading;

  const handleClick = async () => {
    if (activeLoading) return;
    try {
      const res = onRefresh();
      if (res && typeof (res as any).then === 'function') {
        setInternalLoading(true);
        await res;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={activeLoading}
      title={label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-border bg-white dark:bg-card text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-accent font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
        isSmall ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
      } ${className}`}
    >
      <RotateCw
        className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-500 dark:text-slate-400 ${
          activeLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''
        }`}
      />
      {!iconOnly && <span>{activeLoading ? 'Refreshing...' : label}</span>}
    </button>
  );
};
