import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SalesScript } from './types';
import { getSalesScripts } from '../api';

interface SalesScriptsState {
  scriptsByTenant: Record<string, SalesScript[]>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  loadSalesScripts: (tenantId: string) => Promise<void>;
  setSalesScripts: (tenantId: string, scripts: SalesScript[]) => void;
  addSalesScript: (tenantId: string, script: SalesScript) => void;
  updateSalesScript: (tenantId: string, script: SalesScript) => void;
  removeSalesScript: (tenantId: string, scriptId: string) => void;
  clearSalesScripts: (tenantId: string) => void;
  setLoading: (tenantId: string, loading: boolean) => void;
  setError: (tenantId: string, error: string | null) => void;
}

export const useSalesScriptsStore = create<SalesScriptsState>()(
  (set, get) => ({
    scriptsByTenant: {},
    loadingByTenant: {},
    errorsByTenant: {},

    loadSalesScripts: async (tenantId: string) => {
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
        const response = await getSalesScripts(tenantId);
        set((state) => ({
          scriptsByTenant: {
            ...state.scriptsByTenant,
            [tenantId]: response.data,
          },
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
          errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке скриптов продаж';
        set((state) => ({
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
          errorsByTenant: {
            ...state.errorsByTenant,
            [tenantId]: errorMessage,
          },
        }));
      }
    },

    setSalesScripts: (tenantId: string, scripts: SalesScript[]) => {
      set((state) => ({
        scriptsByTenant: { ...state.scriptsByTenant, [tenantId]: scripts },
      }));
    },

    addSalesScript: (tenantId: string, script: SalesScript) => {
      set((state) => {
        const existingScripts = state.scriptsByTenant[tenantId] || [];
        const scriptExists = existingScripts.some((s) => s.id === script.id);

        if (scriptExists) {
          // Обновляем существующий скрипт
          return {
            scriptsByTenant: {
              ...state.scriptsByTenant,
              [tenantId]: existingScripts.map((s) =>
                s.id === script.id ? script : s
              ),
            },
          };
        }

        // Добавляем новый скрипт
        return {
          scriptsByTenant: {
            ...state.scriptsByTenant,
            [tenantId]: [...existingScripts, script],
          },
        };
      });
    },

    updateSalesScript: (tenantId: string, script: SalesScript) => {
      set((state) => {
        const existingScripts = state.scriptsByTenant[tenantId] || [];
        return {
          scriptsByTenant: {
            ...state.scriptsByTenant,
            [tenantId]: existingScripts.map((s) =>
              s.id === script.id ? script : s
            ),
          },
        };
      });
    },

    removeSalesScript: (tenantId: string, scriptId: string) => {
      set((state) => {
        const existingScripts = state.scriptsByTenant[tenantId] || [];
        return {
          scriptsByTenant: {
            ...state.scriptsByTenant,
            [tenantId]: existingScripts.filter((s) => s.id !== scriptId),
          },
        };
      });
    },

    clearSalesScripts: (tenantId: string) => {
      set((state) => {
        const { [tenantId]: _, ...restScripts } = state.scriptsByTenant;
        const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
        const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;

        return {
          scriptsByTenant: restScripts,
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
  })
);

/**
 * Custom селекторы для оптимизации производительности
 * Используйте эти хуки вместо прямого обращения к store
 */

// Пустой массив для использования как fallback (чтобы не создавать новый на каждый рендер)
const EMPTY_SALES_SCRIPTS: SalesScript[] = [];

/**
 * Получить скрипты продаж для конкретного тенанта
 */
export const useSalesScriptsForTenant = (tenantId: string) =>
  useSalesScriptsStore(
    (state) => state.scriptsByTenant[tenantId] ?? EMPTY_SALES_SCRIPTS
  );

/**
 * Получить статус загрузки для конкретного тенанта
 */
export const useSalesScriptsLoading = (tenantId: string) =>
  useSalesScriptsStore(
    (state) => state.loadingByTenant[tenantId] ?? true
  );

/**
 * Получить ошибку для конкретного тенанта
 */
export const useSalesScriptsError = (tenantId: string) =>
  useSalesScriptsStore(
    (state) => state.errorsByTenant[tenantId] ?? null
  );

/**
 * Получить actions (не вызывают ре-рендер)
 */
export const useSalesScriptsActions = () =>
  useSalesScriptsStore(
    useShallow((state) => ({
      loadSalesScripts: state.loadSalesScripts,
      setSalesScripts: state.setSalesScripts,
      addSalesScript: state.addSalesScript,
      updateSalesScript: state.updateSalesScript,
      removeSalesScript: state.removeSalesScript,
      clearSalesScripts: state.clearSalesScripts,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );
