import { useState, useCallback } from 'react';
import { searchTenants } from '@/entities/tenant-search';
import type { TenantSearchParams } from '@/entities/tenant-search';

export type SelectionMode = 'individual' | 'all';

export interface UseSelectionOptions {
  initData: string | null;
  currentFilters: Omit<TenantSearchParams, 'page' | 'perPage'>;
  totalCount: number;
}

export function useSelection({ initData, currentFilters, totalCount }: UseSelectionOptions) {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('individual');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleUser = useCallback((tenantId: string) => {
    // Switch to individual mode if in "all" mode and user clicks a checkbox
    setSelectionMode('individual');

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tenantId)) {
        next.delete(tenantId);
      } else {
        next.add(tenantId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectionMode('all');
    setSelectedIds(new Set()); // Clear individual selections
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionMode('individual');
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (tenantId: string) => {
      if (selectionMode === 'all') {
        return true; // In "all" mode, all users are considered selected
      }
      return selectedIds.has(tenantId);
    },
    [selectionMode, selectedIds]
  );

  const getSelectedCount = useCallback(() => {
    if (selectionMode === 'all') {
      return totalCount;
    }
    return selectedIds.size;
  }, [selectionMode, selectedIds.size, totalCount]);

  const getTenantIdsForSending = useCallback(async (): Promise<string[]> => {
    if (selectionMode === 'individual') {
      return Array.from(selectedIds);
    }

    // "all" mode: Fetch all pages to collect all tenant IDs
    if (!initData) {
      throw new Error('Отсутствуют данные авторизации');
    }

    const allTenantIds: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await searchTenants(
          {
            ...currentFilters,
            page,
            perPage: 100, // Max per page
          },
          initData
        );

        allTenantIds.push(...response.data.map((u) => u.tenantId));
        hasMore = page < response.meta.totalPages;
        page++;
      } catch (error) {
        console.error('[useSelection] Error fetching page', page, error);
        throw new Error('Не удалось получить список пользователей для рассылки');
      }
    }

    return allTenantIds;
  }, [selectionMode, selectedIds, currentFilters, initData]);

  return {
    selectionMode,
    selectedIds,
    toggleUser,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedCount,
    getTenantIdsForSending,
  };
}
