import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdsFilters } from './types';

interface AdsFiltersState {
  filtersByTenant: Record<string, AdsFilters>;
  setFilters: (tenantId: string, filters: AdsFilters) => void;
  clearFilters: (tenantId: string) => void;
}

export const useAdsFiltersStore = create<AdsFiltersState>()(
  persist(
    (set, get) => ({
      filtersByTenant: {},
      setFilters: (tenantId, filters) =>
        set((state) => ({
          filtersByTenant: { ...state.filtersByTenant, [tenantId]: filters },
        })),
      clearFilters: (tenantId) =>
        set((state) => {
          const { [tenantId]: _, ...rest } = state.filtersByTenant;
          return { filtersByTenant: rest };
        }),
    }),
    { name: 'ads-filters-storage' }
  )
);

// Constant empty object for stable reference
const EMPTY_FILTERS: AdsFilters = {};

// Hooks for easier access
export function useAdsFilters(tenantId: string): AdsFilters {
  return useAdsFiltersStore(
    (state) => state.filtersByTenant[tenantId] ?? EMPTY_FILTERS
  );
}

export function useAdsFiltersActions() {
  return {
    setFilters: useAdsFiltersStore((state) => state.setFilters),
    clearFilters: useAdsFiltersStore((state) => state.clearFilters),
  };
}
