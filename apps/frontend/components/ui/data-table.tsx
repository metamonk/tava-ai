'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  className,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-[#e8e6e1] dark:bg-[#2a2f35] rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-[#e8e6e1] dark:bg-[#2a2f35] rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[#6b7280] dark:text-[#9ca3af]">{emptyMessage}</div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[#e8e6e1] dark:border-[#2a2f35]',
        className
      )}
    >
      <table className="min-w-full divide-y divide-[#e8e6e1] dark:divide-[#2a2f35]">
        <thead className="bg-[#faf8f5] dark:bg-[#1a1d21]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider',
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#161a1d] divide-y divide-[#e8e6e1] dark:divide-[#2a2f35]">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={cn(
                onRowClick &&
                  'cursor-pointer hover:bg-[#faf8f5] dark:hover:bg-[#1a1d21] transition-colors'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-6 py-4 whitespace-nowrap text-sm text-[#1a1d21] dark:text-[#f5f3ef]',
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
