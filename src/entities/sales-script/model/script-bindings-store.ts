import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { ScriptBinding } from './types';
import {
  getScriptBindings,
  createScriptBinding,
  deleteScriptBinding,
} from '../api';

interface ScriptBindingsState {
  bindingsByScriptId: Record<string, ScriptBinding[] | undefined>;
  loadingByScriptId: Record<string, boolean | undefined>;
  errorsByScriptId: Record<string, string | null | undefined>;
  loadScriptBindings: (
    scriptId: string,
    tenantId: string,
    force?: boolean
  ) => Promise<void>;
  getAccountBinding: (
    scriptId: string,
    tenantId: string
  ) => ScriptBinding | null | undefined;
  attachToAccount: (
    scriptId: string,
    tenantId: string,
    accountId: string,
    isActive?: boolean
  ) => Promise<void>;
  detachFromAccount: (
    scriptId: string,
    tenantId: string,
    bindingId: string
  ) => Promise<void>;
  clearScript: (scriptId: string) => void;
}

export const useScriptBindingsStore = create<ScriptBindingsState>()(
  (set, get) => ({
    bindingsByScriptId: {},
    loadingByScriptId: {},
    errorsByScriptId: {},

    async loadScriptBindings(scriptId, tenantId, force = false) {
      const state = get();
      if (state.loadingByScriptId[scriptId]) return;
      if (!force && state.bindingsByScriptId[scriptId]) return;

      set((s) => ({
        loadingByScriptId: { ...s.loadingByScriptId, [scriptId]: true },
        errorsByScriptId: { ...s.errorsByScriptId, [scriptId]: null },
      }));

      try {
        const resp = await getScriptBindings(scriptId, tenantId);
        set((s) => ({
          bindingsByScriptId: {
            ...s.bindingsByScriptId,
            [scriptId]: resp.data,
          },
          loadingByScriptId: { ...s.loadingByScriptId, [scriptId]: false },
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке привязок скрипта';
        set((s) => ({
          loadingByScriptId: { ...s.loadingByScriptId, [scriptId]: false },
          errorsByScriptId: { ...s.errorsByScriptId, [scriptId]: message },
        }));
      }
    },

    getAccountBinding(scriptId, tenantId) {
      const state = get();
      const bindings = state.bindingsByScriptId[scriptId];
      if (!bindings) {
        // Если привязки не загружены, возвращаем undefined
        return undefined;
      }
      // Ищем активную привязку к аккаунту (где avitoAdId === null или undefined)
      const accountBinding = bindings.find(
        (b) =>
          b.isActive &&
          (b.avitoAdId === null || b.avitoAdId === undefined) &&
          b.avitoAccountId
      );
      return accountBinding || null;
    },

    async attachToAccount(scriptId, tenantId, accountId, isActive = true) {
      await createScriptBinding(scriptId, tenantId, {
        avitoAccountId: accountId,
        avitoAdId: null,
        priority: 100,
        isActive,
      });

      // Перезагружаем привязки скрипта
      await get().loadScriptBindings(scriptId, tenantId, true);
    },

    async detachFromAccount(scriptId, tenantId, bindingId) {
      await deleteScriptBinding(bindingId, tenantId);
      // После успешного удаления обновляем кеш
      set((s) => {
        const current = s.bindingsByScriptId[scriptId] || [];
        return {
          bindingsByScriptId: {
            ...s.bindingsByScriptId,
            [scriptId]: current.filter((b) => b.id !== bindingId),
          },
        };
      });
    },

    clearScript(scriptId) {
      set((s) => {
        const { [scriptId]: _, ...restBindings } = s.bindingsByScriptId;
        const { [scriptId]: __, ...restLoading } = s.loadingByScriptId;
        const { [scriptId]: ___, ...restErrors } = s.errorsByScriptId;
        return {
          bindingsByScriptId: restBindings,
          loadingByScriptId: restLoading,
          errorsByScriptId: restErrors,
        };
      });
    },
  })
);

// Селекторы/хуки
export const useScriptBindings = (scriptId: string) =>
  useScriptBindingsStore((s) => s.bindingsByScriptId[scriptId]);

export const useScriptBindingsLoading = (scriptId: string) =>
  useScriptBindingsStore((s) => s.loadingByScriptId[scriptId] ?? false);

export const useScriptBindingsError = (scriptId: string) =>
  useScriptBindingsStore((s) => s.errorsByScriptId[scriptId] ?? null);

export const useScriptBindingsActions = () =>
  useScriptBindingsStore(
    useShallow((s) => ({
      loadScriptBindings: s.loadScriptBindings,
      getAccountBinding: s.getAccountBinding,
      attachToAccount: s.attachToAccount,
      detachFromAccount: s.detachFromAccount,
      clearScript: s.clearScript,
    }))
  );

