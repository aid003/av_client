import { useState, useCallback } from 'react';
import { getAvitoAds } from '../api';
import type { AvitoAd, AvitoAdsPaginationMeta } from '../model/types';

export interface AdsFilters {
  search?: string;
  status?: string;
  categoryId?: number;
}

interface UseTableAdsOptions {
  perPage?: number;
  filters?: AdsFilters;
}

interface UseTableAdsReturn {
  ads: AvitoAd[];
  meta: AvitoAdsPaginationMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTableAds(
  tenantId: string,
  options: UseTableAdsOptions = {}
): UseTableAdsReturn {
  const { perPage = 25, filters = {} } = options;

  const [ads, setAds] = useState<AvitoAd[]>([]);
  const [meta, setMeta] = useState<AvitoAdsPaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const hasMore = meta ? currentPage < meta.totalPages : false;

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAvitoAds(tenantId, {
        page: 1,
        perPage,
        status: filters.status || 'ACTIVE',
        search: filters.search,
        categoryId: filters.categoryId,
      });

      setAds(response.data);
      setMeta(response.meta);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке объявлений'
      );
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, perPage, filters.status, filters.search, filters.categoryId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getAvitoAds(tenantId, {
        page: nextPage,
        perPage,
        status: filters.status || 'ACTIVE',
        search: filters.search,
        categoryId: filters.categoryId,
      });

      setAds((prev) => [...prev, ...response.data]);
      setMeta(response.meta);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке объявлений'
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    tenantId,
    perPage,
    currentPage,
    hasMore,
    isLoadingMore,
    filters.status,
    filters.search,
    filters.categoryId,
  ]);

  const refresh = useCallback(async () => {
    setAds([]);
    setMeta(null);
    setCurrentPage(1);
    await loadInitial();
  }, [loadInitial]);

  return {
    ads,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
  };
}
