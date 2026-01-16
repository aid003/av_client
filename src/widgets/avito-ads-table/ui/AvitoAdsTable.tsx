'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { AvitoAdsTable as AvitoAdsTableComponent, useTableAds, type AvitoAd, createColumns } from '@/entities/avito-ad';
import { AdsSearch, AdsFilters, useAdsFilters } from '@/features/ads-filters';
import { ColumnSettingsDropdown, useColumnSettings, useColumnSettingsActions } from '@/features/ads-column-settings';
import { SyncAvitoAdsButton } from '@/features/sync-avito-ads';
import { ViewAdKnowledgeBasesDialog } from '@/features/view-ad-knowledge-bases';
import { useAdKbActions } from '@/entities/ad-knowledge-link/model/store';
import { useAdScriptBindingActions } from '@/entities/ad-script-binding/model/store';

interface AvitoAdsTableProps {
  tenantId: string;
}

export function AvitoAdsTable({ tenantId }: AvitoAdsTableProps) {
  const filters = useAdsFilters(tenantId);
  const columnSettings = useColumnSettings(tenantId);
  const { updateSettings } = useColumnSettingsActions();

  const {
    ads,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
  } = useTableAds(tenantId, { filters });

  const [selectedAd, setSelectedAd] = useState<AvitoAd | null>(null);
  const [isKbDialogOpen, setIsKbDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnVisibility = columnSettings.visibility;

  // Clear sorting state for hidden columns
  useEffect(() => {
    if (sorting.length === 0) return;

    const hasInvisibleSortedColumn = sorting.some(
      (sort) => columnVisibility[sort.id] === false
    );

    if (hasInvisibleSortedColumn) {
      setSorting((prev) =>
        prev.filter((sort) => columnVisibility[sort.id] !== false)
      );
    }
  }, [columnVisibility, sorting]);

  const { loadLinks } = useAdKbActions();
  const { loadBindings } = useAdScriptBindingActions();

  useEffect(() => {
    loadInitial();
  }, [loadInitial, filters]);

  const handleSyncSuccess = () => refresh();

  const handleViewKb = useCallback((ad: AvitoAd) => {
    setSelectedAd(ad);
    setIsKbDialogOpen(true);
  }, []);

  // Lazy load related data for visible ads
  useEffect(() => {
    if (ads.length === 0) return;
    ads.forEach((ad) => {
      loadLinks(ad.id, tenantId);
      loadBindings(ad.id, tenantId);
    });
  }, [ads, tenantId, loadLinks, loadBindings]);

  // Create table instance
  const columns = useMemo(
    () => createColumns(handleViewKb),
    [handleViewKb]
  );

  const handleColumnVisibilityChange = useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      const next =
        typeof updater === 'function' ? updater(columnVisibility) : updater;
      updateSettings(tenantId, { visibility: next });
    },
    [columnVisibility, tenantId, updateSettings]
  );

  const table = useReactTable({
    data: ads,
    columns,
    columnResizeMode: 'onChange',
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Объявления</h2>
          {meta && (
            <p className="text-sm text-muted-foreground mt-1">
              Показано {ads.length} из {meta.total}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:gap-2">
          <ColumnSettingsDropdown table={table} tenantId={tenantId} />
          <SyncAvitoAdsButton tenantId={tenantId} onSuccess={handleSyncSuccess} />
        </div>
      </div>

      {/* Search */}
      <AdsSearch tenantId={tenantId} />

      {/* Filters */}
      <AdsFilters tenantId={tenantId} />

      {/* Table */}
      <AvitoAdsTableComponent
        table={table}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        onLoadMore={loadMore}
      />

      {/* Knowledge Bases Dialog */}
      <ViewAdKnowledgeBasesDialog
        ad={selectedAd}
        tenantId={tenantId}
        open={isKbDialogOpen}
        onOpenChange={setIsKbDialogOpen}
      />
    </div>
  );
}
