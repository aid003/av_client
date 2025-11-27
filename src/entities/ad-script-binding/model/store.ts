import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { ScriptBinding } from '@/entities/sales-script/model/types';
import {
  getAdScriptBindings,
  createScriptBinding,
  deleteScriptBinding,
} from '@/entities/sales-script/api';

interface AdScriptBindingState {
  bindingsByAdId: Record<string, ScriptBinding[] | undefined>;
  loadingByAdId: Record<string, boolean | undefined>;
  errorsByAdId: Record<string, string | null | undefined>;
  loadBindings: (adId: string, tenantId: string, force?: boolean) => Promise<void>;
  setBindings: (adId: string, bindings: ScriptBinding[]) => void;
  attachBindings: (
    adIds: string[],
    tenantId: string,
    scriptId: string,
    isActive?: boolean
  ) => Promise<{ success: string[]; failed: Array<{ adId: string; error: string }> }>;
  checkBindingConflicts: (
    adIds: string[],
    tenantId: string
  ) => Promise<{
    adsWithExistingBindings: Array<{
      adId: string;
      existingBinding: ScriptBinding;
    }>;
    adsWithoutBindings: string[];
  }>;
  detachBinding: (adId: string, tenantId: string, bindingId: string) => Promise<void>;
  clearAd: (adId: string) => void;
}

export const useAdScriptBindingStore = create<AdScriptBindingState>()(
  (set, get) => ({
    bindingsByAdId: {},
    loadingByAdId: {},
    errorsByAdId: {},

    async loadBindings(adId, tenantId, force = false) {
      const state = get();
      if (state.loadingByAdId[adId]) return;
      if (!force && state.bindingsByAdId[adId]) return;

      set((s) => ({
        loadingByAdId: { ...s.loadingByAdId, [adId]: true },
        errorsByAdId: { ...s.errorsByAdId, [adId]: null },
      }));

      try {
        const resp = await getAdScriptBindings(adId, tenantId);
        set((s) => ({
          bindingsByAdId: { ...s.bindingsByAdId, [adId]: resp.data },
          loadingByAdId: { ...s.loadingByAdId, [adId]: false },
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке привязок скриптов';
        set((s) => ({
          loadingByAdId: { ...s.loadingByAdId, [adId]: false },
          errorsByAdId: { ...s.errorsByAdId, [adId]: message },
        }));
      }
    },

    setBindings(adId, bindings) {
      set((s) => ({ bindingsByAdId: { ...s.bindingsByAdId, [adId]: bindings } }));
    },

    async attachBindings(adIds, tenantId, scriptId, isActive = true) {
      const results = await Promise.allSettled(
        adIds.map(async (adId) => {
          await createScriptBinding(scriptId, tenantId, {
            avitoAdId: adId,
            priority: 100,
            isActive,
          });

          // Перезагружаем привязки для конкретного объявления
          const resp = await getAdScriptBindings(adId, tenantId);
          set((s) => ({
            bindingsByAdId: { ...s.bindingsByAdId, [adId]: resp.data },
          }));
          return adId;
        })
      );

      const success: string[] = [];
      const failed: Array<{ adId: string; error: string }> = [];
      results.forEach((r, idx) => {
        const adId = adIds[idx];
        if (r.status === 'fulfilled') {
          success.push(adId);
        } else {
          let errorMessage = r.reason instanceof Error ? r.reason.message : 'Ошибка';

          // Check for unique constraint violation
          if (
            errorMessage.includes('unique') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('constraint')
          ) {
            errorMessage = 'У этого объявления уже есть привязанный скрипт';
          }

          failed.push({
            adId,
            error: errorMessage,
          });
        }
      });
      return { success, failed };
    },

    async checkBindingConflicts(adIds, tenantId) {
      const results = await Promise.allSettled(
        adIds.map(async (adId) => {
          const resp = await getAdScriptBindings(adId, tenantId);
          return { adId, bindings: resp.data };
        })
      );

      const adsWithExistingBindings: Array<{
        adId: string;
        existingBinding: ScriptBinding;
      }> = [];
      const adsWithoutBindings: string[] = [];

      results.forEach((result, idx) => {
        const adId = adIds[idx];
        if (result.status === 'fulfilled') {
          const activeBindings = result.value.bindings.filter((b) => b.isActive);
          if (activeBindings.length > 0) {
            adsWithExistingBindings.push({
              adId,
              existingBinding: activeBindings[0],
            });
          } else {
            adsWithoutBindings.push(adId);
          }
        } else {
          // On error, assume no binding
          adsWithoutBindings.push(adId);
        }
      });

      return { adsWithExistingBindings, adsWithoutBindings };
    },

    async detachBinding(adId, tenantId, bindingId) {
      await deleteScriptBinding(bindingId, tenantId);
      // После успешного удаления - убираем из кеша
      set((s) => {
        const current = s.bindingsByAdId[adId] || [];
        return {
          bindingsByAdId: {
            ...s.bindingsByAdId,
            [adId]: current.filter((b) => b.id !== bindingId),
          },
        };
      });
    },

    clearAd(adId) {
      set((s) => {
        const { [adId]: _, ...restBindings } = s.bindingsByAdId;
        const { [adId]: __, ...restLoading } = s.loadingByAdId;
        const { [adId]: ___, ...restErrors } = s.errorsByAdId;
        return {
          bindingsByAdId: restBindings,
          loadingByAdId: restLoading,
          errorsByAdId: restErrors,
        };
      });
    },
  })
);

// Селекторы/хуки
export const useAdScriptBindings = (adId: string) =>
  useAdScriptBindingStore((s) => s.bindingsByAdId[adId]);

export const useAdScriptBindingLoading = (adId: string) =>
  useAdScriptBindingStore((s) => s.loadingByAdId[adId] ?? false);

export const useAdScriptBindingError = (adId: string) =>
  useAdScriptBindingStore((s) => s.errorsByAdId[adId] ?? null);

export const useAdScriptBindingActions = () =>
  useAdScriptBindingStore(
    useShallow((s) => ({
      loadBindings: s.loadBindings,
      setBindings: s.setBindings,
      attachBindings: s.attachBindings,
      checkBindingConflicts: s.checkBindingConflicts,
      detachBinding: s.detachBinding,
      clearAd: s.clearAd,
    }))
  );
