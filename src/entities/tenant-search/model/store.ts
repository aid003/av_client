import { create } from 'zustand';
import type {
  TenantSearchResult,
  TenantSearchMeta,
  TenantSearchParams,
} from './types';
import { searchTenants } from '../api';

interface TenantSearchState {
  // Data
  users: TenantSearchResult[];
  meta: TenantSearchMeta | null;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;

  // Filters
  filters: Omit<TenantSearchParams, 'page' | 'perPage'>;

  // Actions
  loadInitial: (initData: string) => Promise<void>;
  loadMore: (initData: string) => Promise<void>;
  updateFilters: (filters: Partial<Omit<TenantSearchParams, 'page' | 'perPage'>>) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  users: [],
  meta: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: false,
  error: null,
  filters: {},
};

const PER_PAGE = 20;

export const useTenantSearchStore = create<TenantSearchState>((set, get) => ({
  ...INITIAL_STATE,

  loadInitial: async (initData: string) => {
    set({ isLoading: true, error: null, users: [], meta: null });

    try {
      const response = await searchTenants(
        {
          ...get().filters,
          page: 1,
          perPage: PER_PAGE,
        },
        initData
      );

      set({
        users: response.data,
        meta: response.meta,
        hasMore: response.meta.page < response.meta.totalPages,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ошибка при загрузке пользователей';
      set({
        error: errorMessage,
        isLoading: false,
        users: [],
        meta: null,
        hasMore: false,
      });
      console.error('[TenantSearchStore] loadInitial error:', error);
    }
  },

  loadMore: async (initData: string) => {
    const { meta, isLoadingMore, hasMore } = get();

    if (isLoadingMore || !hasMore || !meta) return;

    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = meta.page + 1;

      const response = await searchTenants(
        {
          ...get().filters,
          page: nextPage,
          perPage: PER_PAGE,
        },
        initData
      );

      set({
        users: [...get().users, ...response.data],
        meta: response.meta,
        hasMore: response.meta.page < response.meta.totalPages,
        isLoadingMore: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ошибка при загрузке пользователей';
      set({
        error: errorMessage,
        isLoadingMore: false,
      });
      console.error('[TenantSearchStore] loadMore error:', error);
    }
  },

  updateFilters: (newFilters) => {
    set({
      filters: {
        ...get().filters,
        ...newFilters,
      },
    });
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));

// Selectors
export const useTenantSearchUsers = () =>
  useTenantSearchStore((state) => state.users);

export const useTenantSearchMeta = () =>
  useTenantSearchStore((state) => state.meta);

export const useTenantSearchLoading = () =>
  useTenantSearchStore((state) => state.isLoading);

export const useTenantSearchLoadingMore = () =>
  useTenantSearchStore((state) => state.isLoadingMore);

export const useTenantSearchHasMore = () =>
  useTenantSearchStore((state) => state.hasMore);

export const useTenantSearchError = () =>
  useTenantSearchStore((state) => state.error);

export const useTenantSearchFilters = () =>
  useTenantSearchStore((state) => state.filters);

// Action hooks - stable references
export const useTenantSearchLoadInitial = () =>
  useTenantSearchStore((state) => state.loadInitial);

export const useTenantSearchLoadMore = () =>
  useTenantSearchStore((state) => state.loadMore);

export const useTenantSearchUpdateFilters = () =>
  useTenantSearchStore((state) => state.updateFilters);

export const useTenantSearchReset = () =>
  useTenantSearchStore((state) => state.reset);
