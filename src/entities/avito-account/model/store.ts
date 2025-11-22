import { create } from 'zustand';
import type { AvitoAccount } from './types';
import { getAvitoAccounts } from '../api';

interface AvitoAccountsState {
  accountsByTenant: Record<string, AvitoAccount[]>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  loadAccounts: (tenantId: string) => Promise<void>;
  setAccounts: (tenantId: string, accounts: AvitoAccount[]) => void;
  addAccount: (tenantId: string, account: AvitoAccount) => void;
  removeAccount: (tenantId: string, accountId: string) => void;
  clearAccounts: (tenantId: string) => void;
  setLoading: (tenantId: string, loading: boolean) => void;
  setError: (tenantId: string, error: string | null) => void;
}

export const useAvitoAccountsStore = create<AvitoAccountsState>()((set, get) => ({
  accountsByTenant: {},
  loadingByTenant: {},
  errorsByTenant: {},

  loadAccounts: async (tenantId: string) => {
    const state = get();

    // Если уже загружается, не делаем повторный запрос
    if (state.loadingByTenant[tenantId]) {
      return;
    }

    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
    }));

    try {
      const accounts = await getAvitoAccounts(tenantId);
      set((state) => ({
        accountsByTenant: { ...state.accountsByTenant, [tenantId]: accounts },
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка при загрузке аккаунтов';
      set((state) => ({
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },

  setAccounts: (tenantId: string, accounts: AvitoAccount[]) => {
    set((state) => ({
      accountsByTenant: { ...state.accountsByTenant, [tenantId]: accounts },
    }));
  },

  addAccount: (tenantId: string, account: AvitoAccount) => {
    set((state) => {
      const existingAccounts = state.accountsByTenant[tenantId] || [];
      const accountExists = existingAccounts.some((acc) => acc.id === account.id);

      if (accountExists) {
        // Обновляем существующий аккаунт
        return {
          accountsByTenant: {
            ...state.accountsByTenant,
            [tenantId]: existingAccounts.map((acc) =>
              acc.id === account.id ? account : acc
            ),
          },
        };
      }

      // Добавляем новый аккаунт
      return {
        accountsByTenant: {
          ...state.accountsByTenant,
          [tenantId]: [...existingAccounts, account],
        },
      };
    });
  },

  removeAccount: (tenantId: string, accountId: string) => {
    set((state) => {
      const existingAccounts = state.accountsByTenant[tenantId] || [];
      return {
        accountsByTenant: {
          ...state.accountsByTenant,
          [tenantId]: existingAccounts.filter((acc) => acc.id !== accountId),
        },
      };
    });
  },

  clearAccounts: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restAccounts } = state.accountsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
      const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;

      return {
        accountsByTenant: restAccounts,
        loadingByTenant: restLoading,
        errorsByTenant: restErrors,
      };
    });
  },

  setLoading: (tenantId: string, loading: boolean) => {
    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: loading },
    }));
  },

  setError: (tenantId: string, error: string | null) => {
    set((state) => ({
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: error },
    }));
  },
}));
