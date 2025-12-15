import { useCallback } from 'react';
import {
  useTenantSearchFilters,
  useTenantSearchUpdateFilters,
} from '@/entities/tenant-search';

export function useSearchFilters() {
  const filters = useTenantSearchFilters();
  const updateFilters = useTenantSearchUpdateFilters();

  const setSearch = useCallback(
    (search: string) => {
      updateFilters({ search: search || undefined });
    },
    [updateFilters]
  );

  const setRegisteredFrom = useCallback(
    (registeredFrom: string) => {
      updateFilters({ registeredFrom: registeredFrom || undefined });
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    updateFilters({ search: undefined, registeredFrom: undefined });
  }, [updateFilters]);

  const hasActiveFilters = !!(filters.search || filters.registeredFrom);

  return {
    filters,
    setSearch,
    setRegisteredFrom,
    clearFilters,
    hasActiveFilters,
  };
}
