import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { KnowledgeBase } from './types';
import { getKnowledgeBases } from '../api';

interface KnowledgeBasesState {
  kbsByTenant: Record<string, KnowledgeBase[]>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  loadKnowledgeBases: (tenantId: string) => Promise<void>;
  setKnowledgeBases: (tenantId: string, kbs: KnowledgeBase[]) => void;
  addKnowledgeBase: (tenantId: string, kb: KnowledgeBase) => void;
  updateKnowledgeBase: (tenantId: string, kb: KnowledgeBase) => void;
  removeKnowledgeBase: (tenantId: string, kbId: string) => void;
  clearKnowledgeBases: (tenantId: string) => void;
  setLoading: (tenantId: string, loading: boolean) => void;
  setError: (tenantId: string, error: string | null) => void;
}

export const useKnowledgeBasesStore = create<KnowledgeBasesState>()(
  (set, get) => ({
    kbsByTenant: {},
    loadingByTenant: {},
    errorsByTenant: {},

    loadKnowledgeBases: async (tenantId: string) => {
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
        const response = await getKnowledgeBases(tenantId);
        set((state) => ({
          kbsByTenant: { ...state.kbsByTenant, [tenantId]: response.data },
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
          errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке баз знаний';
        set((state) => ({
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
          errorsByTenant: {
            ...state.errorsByTenant,
            [tenantId]: errorMessage,
          },
        }));
      }
    },

    setKnowledgeBases: (tenantId: string, kbs: KnowledgeBase[]) => {
      set((state) => ({
        kbsByTenant: { ...state.kbsByTenant, [tenantId]: kbs },
      }));
    },

    addKnowledgeBase: (tenantId: string, kb: KnowledgeBase) => {
      set((state) => {
        const existingKbs = state.kbsByTenant[tenantId] || [];
        const kbExists = existingKbs.some((existing) => existing.id === kb.id);

        if (kbExists) {
          // Обновляем существующую базу знаний
          return {
            kbsByTenant: {
              ...state.kbsByTenant,
              [tenantId]: existingKbs.map((existing) =>
                existing.id === kb.id ? kb : existing
              ),
            },
          };
        }

        // Добавляем новую базу знаний
        return {
          kbsByTenant: {
            ...state.kbsByTenant,
            [tenantId]: [...existingKbs, kb],
          },
        };
      });
    },

    updateKnowledgeBase: (tenantId: string, kb: KnowledgeBase) => {
      set((state) => {
        const existingKbs = state.kbsByTenant[tenantId] || [];
        return {
          kbsByTenant: {
            ...state.kbsByTenant,
            [tenantId]: existingKbs.map((existing) =>
              existing.id === kb.id ? kb : existing
            ),
          },
        };
      });
    },

    removeKnowledgeBase: (tenantId: string, kbId: string) => {
      set((state) => {
        const existingKbs = state.kbsByTenant[tenantId] || [];
        return {
          kbsByTenant: {
            ...state.kbsByTenant,
            [tenantId]: existingKbs.filter((kb) => kb.id !== kbId),
          },
        };
      });
    },

    clearKnowledgeBases: (tenantId: string) => {
      set((state) => {
        const { [tenantId]: _, ...restKbs } = state.kbsByTenant;
        const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
        const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;

        return {
          kbsByTenant: restKbs,
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
const EMPTY_KNOWLEDGE_BASES: KnowledgeBase[] = [];

/**
 * Получить базы знаний для конкретного тенанта
 */
export const useKnowledgeBasesForTenant = (tenantId: string) =>
  useKnowledgeBasesStore(
    (state) => state.kbsByTenant[tenantId] ?? EMPTY_KNOWLEDGE_BASES
  );

/**
 * Получить статус загрузки для конкретного тенанта
 */
export const useKnowledgeBasesLoading = (tenantId: string) =>
  useKnowledgeBasesStore(
    (state) => state.loadingByTenant[tenantId] ?? true
  );

/**
 * Получить ошибку для конкретного тенанта
 */
export const useKnowledgeBasesError = (tenantId: string) =>
  useKnowledgeBasesStore(
    (state) => state.errorsByTenant[tenantId] ?? null
  );

/**
 * Получить actions (не вызывают ре-рендер)
 */
export const useKnowledgeBasesActions = () =>
  useKnowledgeBasesStore(
    useShallow((state) => ({
      loadKnowledgeBases: state.loadKnowledgeBases,
      setKnowledgeBases: state.setKnowledgeBases,
      addKnowledgeBase: state.addKnowledgeBase,
      updateKnowledgeBase: state.updateKnowledgeBase,
      removeKnowledgeBase: state.removeKnowledgeBase,
      clearKnowledgeBases: state.clearKnowledgeBases,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );
