import { useState, useCallback } from 'react';
import { getAvitoAds } from '../api';
import type { AvitoAd, AvitoAdsPaginationMeta } from '../model/types';

interface UseInfiniteAdsOptions {
  perPage?: number;
}

interface UseInfiniteAdsReturn {
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

export function useInfiniteAds(
  tenantId: string,
  options: UseInfiniteAdsOptions = {}
): UseInfiniteAdsReturn {
  const { perPage = 25 } = options;

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
        status: 'ACTIVE',
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
  }, [tenantId, perPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getAvitoAds(tenantId, {
        page: nextPage,
        perPage,
        status: 'ACTIVE',
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
  }, [tenantId, perPage, currentPage, hasMore, isLoadingMore]);

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
