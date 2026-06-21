import { ReactNode, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  title: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  dataIndex?: keyof T;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T) => string);
  pageSize?: number;
  showPagination?: boolean;
  emptyText?: string;
  className?: string;
  headerClassName?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  stripe?: boolean;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  pageSize = 10,
  showPagination = true,
  emptyText = '暂无数据',
  className,
  headerClassName,
  onRowClick,
  rowClassName,
  stripe = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (!showPagination) return data;
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize, showPagination]);

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(row);
    if (rowKey) return String(row[rowKey]);
    return String(index);
  };

  const renderCell = (column: Column<T>, row: T, rowIndex: number): ReactNode => {
    if (column.render) return column.render(row, rowIndex);
    if (column.dataIndex) return String(row[column.dataIndex] ?? '');
    return null;
  };

  const startItem = data.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, data.length);

  return (
    <div className={cn('bg-white border border-neutral-200 rounded-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={cn('bg-primary-500 text-white', headerClassName)}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-[13px] whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-neutral-400 text-sm"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-neutral-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    {emptyText}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const globalIndex = (safePage - 1) * pageSize + idx;
                return (
                  <tr
                    key={getRowKey(row, globalIndex)}
                    className={cn(
                      'border-b border-neutral-100 transition-colors',
                      stripe && globalIndex % 2 === 1 && 'bg-neutral-50/70',
                      onRowClick && 'cursor-pointer hover:bg-primary-50/50',
                      rowClassName?.(row, globalIndex)
                    )}
                    onClick={onRowClick ? () => onRowClick(row, globalIndex) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-neutral-700 whitespace-nowrap',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(col, row, globalIndex)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50/50">
          <div className="text-xs text-neutral-600">
            共 <span className="font-medium text-neutral-800">{data.length}</span> 条，显示{' '}
            <span className="font-medium text-neutral-800">{startItem}</span> -{' '}
            <span className="font-medium text-neutral-800">{endItem}</span> 条
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                safePage === 1
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                  : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
              )}
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage === 1}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                safePage === 1
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                  : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
              )}
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center space-x-1 mx-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 5) return true;
                  if (p === 1 || p === totalPages) return true;
                  return Math.abs(p - safePage) <= 1;
                })
                .map((p, idx, arr) => (
                  <div key={p} className="flex items-center">
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <span className="px-1 text-neutral-400 text-xs">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-sm border text-xs font-medium transition-colors',
                        p === safePage
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
                      )}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage === totalPages}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                safePage === totalPages
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                  : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
              )}
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors',
                safePage === totalPages
                  ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-50'
                  : 'border-neutral-300 text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50'
              )}
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
