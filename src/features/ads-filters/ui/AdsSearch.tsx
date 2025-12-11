'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { useAdsFilters, useAdsFiltersActions } from '../model/store';

interface AdsSearchProps {
  tenantId: string;
}

export function AdsSearch({ tenantId }: AdsSearchProps) {
  const filters = useAdsFilters(tenantId);
  const { setFilters } = useAdsFiltersActions();
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce search updates (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(tenantId, { ...filters, search: searchValue || undefined });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, tenantId, setFilters]);

  // Sync with external filter changes
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Поиск по названию, ID..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
