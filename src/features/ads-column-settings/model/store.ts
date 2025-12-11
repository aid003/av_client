import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColumnSettings } from './types';
import { DEFAULT_COLUMN_SETTINGS } from '../lib/default-columns';

interface ColumnSettingsState {
  settingsByTenant: Record<string, ColumnSettings>;
  updateSettings: (
    tenantId: string,
    settings: Partial<ColumnSettings>
  ) => void;
  resetSettings: (tenantId: string) => void;
}

export const useColumnSettingsStore = create<ColumnSettingsState>()(
  persist(
    (set, get) => ({
      settingsByTenant: {},
      updateSettings: (tenantId, updates) =>
        set((state) => {
          const current = state.settingsByTenant[tenantId] ?? DEFAULT_COLUMN_SETTINGS;
          return {
            settingsByTenant: {
              ...state.settingsByTenant,
              [tenantId]: { ...current, ...updates },
            },
          };
        }),
      resetSettings: (tenantId) =>
        set((state) => {
          const { [tenantId]: _, ...rest } = state.settingsByTenant;
          return { settingsByTenant: rest };
        }),
    }),
    { name: 'ads-column-settings' }
  )
);

// Hooks for easier access
export function useColumnSettings(tenantId: string): ColumnSettings {
  return useColumnSettingsStore(
    (state) => state.settingsByTenant[tenantId] ?? DEFAULT_COLUMN_SETTINGS
  );
}

export function useColumnSettingsActions() {
  return {
    updateSettings: useColumnSettingsStore((state) => state.updateSettings),
    resetSettings: useColumnSettingsStore((state) => state.resetSettings),
  };
}
