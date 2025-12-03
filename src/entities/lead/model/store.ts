import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Lead, LeadFilters } from './types';
import { getLeads, getLeadById } from '../api';
import { ERROR_MESSAGES } from '@/shared/lib/error-messages';

interface LeadsState {
  // Leads by tenant
  leadsByTenant: Record<string, Lead[]>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;

  // Active filters by tenant
  filtersByTenant: Record<string, LeadFilters>;

  // Pagination by tenant
  paginationByTenant: Record<
    string,
    { page: number; perPage: number; total: number }
  >;

  // Individual lead details (cached)
  leadsById: Record<string, Lead>;
  loadingById: Record<string, boolean>;
  errorsById: Record<string, string | null>;

  // Actions for list
  loadLeads: (tenantId: string, params?: { page?: number }) => Promise<void>;
  refreshLeads: (tenantId: string) => Promise<void>;
  setFilters: (tenantId: string, filters: LeadFilters) => void;
  clearFilters: (tenantId: string) => void;
  setLeads: (tenantId: string, leads: Lead[]) => void;
  clearLeads: (tenantId: string) => void;

  // Actions for individual leads
  loadLeadDetails: (tenantId: string, leadId: string) => Promise<void>;
  addLead: (tenantId: string, lead: Lead) => void;
  updateLead: (tenantId: string, lead: Lead) => void;
  removeLead: (tenantId: string, leadId: string) => void;
}

export const useLeadsStore = create<LeadsState>()((set, get) => ({
  // Initial state
  leadsByTenant: {},
  loadingByTenant: {},
  errorsByTenant: {},
  filtersByTenant: {},
  paginationByTenant: {},
  leadsById: {},
  loadingById: {},
  errorsById: {},

  // === List Actions ===

  loadLeads: async (tenantId: string, params?: { page?: number }) => {
    const state = get();

    // Prevent duplicate loading
    if (state.loadingByTenant[tenantId]) {
      return;
    }

    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
    }));

    try {
      const filters = state.filtersByTenant[tenantId] || {};
      const pagination = state.paginationByTenant[tenantId] || {
        page: 1,
        perPage: 20,
        total: 0,
      };

      const response = await getLeads(tenantId, {
        ...filters,
        page: params?.page ?? pagination.page,
        perPage: pagination.perPage,
      });

      set((state) => ({
        leadsByTenant: { ...state.leadsByTenant, [tenantId]: response.data },
        paginationByTenant: {
          ...state.paginationByTenant,
          [tenantId]: {
            page: response.page,
            perPage: response.perPage,
            total: response.total,
          },
        },
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_LEADS;
      set((state) => ({
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },

  refreshLeads: async (tenantId: string) => {
    const state = get();
    const filters = state.filtersByTenant[tenantId] || {};
    const pagination = state.paginationByTenant[tenantId] || {
      page: 1,
      perPage: 20,
      total: 0,
    };

    try {
      const response = await getLeads(tenantId, {
        ...filters,
        page: pagination.page,
        perPage: pagination.perPage,
      });

      set((state) => ({
        leadsByTenant: { ...state.leadsByTenant, [tenantId]: response.data },
        paginationByTenant: {
          ...state.paginationByTenant,
          [tenantId]: {
            page: response.page,
            perPage: response.perPage,
            total: response.total,
          },
        },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_LEADS;
      set((state) => ({
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },

  setFilters: (tenantId: string, filters: LeadFilters) => {
    set((state) => ({
      filtersByTenant: { ...state.filtersByTenant, [tenantId]: filters },
      paginationByTenant: {
        ...state.paginationByTenant,
        [tenantId]: { page: 1, perPage: 20, total: 0 },
      },
    }));
  },

  clearFilters: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restFilters } = state.filtersByTenant;
      return { filtersByTenant: restFilters };
    });
  },

  setLeads: (tenantId: string, leads: Lead[]) => {
    set((state) => ({
      leadsByTenant: { ...state.leadsByTenant, [tenantId]: leads },
    }));
  },

  clearLeads: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restLeads } = state.leadsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
      const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;
      const { [tenantId]: ____, ...restFilters } = state.filtersByTenant;
      const { [tenantId]: _____, ...restPagination } = state.paginationByTenant;

      return {
        leadsByTenant: restLeads,
        loadingByTenant: restLoading,
        errorsByTenant: restErrors,
        filtersByTenant: restFilters,
        paginationByTenant: restPagination,
      };
    });
  },

  // === Individual Lead Actions ===

  loadLeadDetails: async (tenantId: string, leadId: string) => {
    const state = get();

    if (state.loadingById[leadId]) {
      return;
    }

    set((state) => ({
      loadingById: { ...state.loadingById, [leadId]: true },
      errorsById: { ...state.errorsById, [leadId]: null },
    }));

    try {
      const lead = await getLeadById(tenantId, leadId);
      set((state) => ({
        leadsById: { ...state.leadsById, [leadId]: lead },
        loadingById: { ...state.loadingById, [leadId]: false },
        errorsById: { ...state.errorsById, [leadId]: null },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_LEAD;
      set((state) => ({
        loadingById: { ...state.loadingById, [leadId]: false },
        errorsById: { ...state.errorsById, [leadId]: errorMessage },
      }));
    }
  },

  addLead: (tenantId: string, lead: Lead) => {
    set((state) => {
      const existingLeads = state.leadsByTenant[tenantId] || [];
      return {
        leadsByTenant: {
          ...state.leadsByTenant,
          [tenantId]: [lead, ...existingLeads],
        },
        leadsById: { ...state.leadsById, [lead.id]: lead },
      };
    });
  },

  updateLead: (tenantId: string, lead: Lead) => {
    set((state) => {
      const existingLeads = state.leadsByTenant[tenantId] || [];
      return {
        leadsByTenant: {
          ...state.leadsByTenant,
          [tenantId]: existingLeads.map((l) => (l.id === lead.id ? lead : l)),
        },
        leadsById: { ...state.leadsById, [lead.id]: lead },
      };
    });
  },

  removeLead: (tenantId: string, leadId: string) => {
    set((state) => {
      const existingLeads = state.leadsByTenant[tenantId] || [];
      const { [leadId]: _, ...restLeadsById } = state.leadsById;
      return {
        leadsByTenant: {
          ...state.leadsByTenant,
          [tenantId]: existingLeads.filter((l) => l.id !== leadId),
        },
        leadsById: restLeadsById,
      };
    });
  },
}));

/**
 * Custom selectors for optimized performance
 */

const EMPTY_LEADS: Lead[] = [];
const EMPTY_FILTERS: LeadFilters = {};
const DEFAULT_PAGINATION = { page: 1, perPage: 20, total: 0 };

export const useLeadsForTenant = (tenantId: string) =>
  useLeadsStore((state) => state.leadsByTenant[tenantId] ?? EMPTY_LEADS);

export const useLeadsLoading = (tenantId: string) =>
  useLeadsStore((state) => state.loadingByTenant[tenantId] ?? true);

export const useLeadsError = (tenantId: string) =>
  useLeadsStore((state) => state.errorsByTenant[tenantId] ?? null);

export const useLeadFilters = (tenantId: string) =>
  useLeadsStore((state) => state.filtersByTenant[tenantId] ?? EMPTY_FILTERS);

export const useLeadPagination = (tenantId: string) =>
  useLeadsStore(
    (state) =>
      state.paginationByTenant[tenantId] ?? DEFAULT_PAGINATION
  );

export const useLeadById = (leadId: string) =>
  useLeadsStore((state) => state.leadsById[leadId]);

export const useLeadDetailsLoading = (leadId: string) =>
  useLeadsStore((state) => state.loadingById[leadId] ?? false);

export const useLeadDetailsError = (leadId: string) =>
  useLeadsStore((state) => state.errorsById[leadId] ?? null);

export const useLeadsActions = () =>
  useLeadsStore(
    useShallow((state) => ({
      loadLeads: state.loadLeads,
      refreshLeads: state.refreshLeads,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      setLeads: state.setLeads,
      clearLeads: state.clearLeads,
      loadLeadDetails: state.loadLeadDetails,
      addLead: state.addLead,
      updateLead: state.updateLead,
      removeLead: state.removeLead,
    }))
  );
