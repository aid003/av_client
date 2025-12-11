'use client';

import { useRef, useCallback } from 'react';
import { flexRender, type Table as TableType } from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/ui/table';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Button } from '@/shared/ui/components/ui/button';
import type { AvitoAd } from '../../model/types';
import { TableSkeleton } from './TableSkeleton';
import { EmptyTable } from './EmptyTable';

interface AvitoAdsTableProps {
  table: TableType<AvitoAd>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
}

export function AvitoAdsTable({
  table,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
}: AvitoAdsTableProps) {

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, onLoadMore]
  );

  const rows = table.getRowModel().rows;

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error && rows.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (rows.length === 0) {
    return <EmptyTable />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      position: 'relative',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                    {/* Column resizer */}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`absolute top-0 right-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary ${
                        header.column.getIsResizing() ? 'bg-primary' : ''
                      }`}
                    />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id}
                ref={index === rows.length - 1 ? lastRowRef : null}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        </div>
      )}
    </div>
  );
}
