import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, ThemeMode } from './types';
import { getTelegramSettings, updateTelegramSettings } from '../api';

interface UserSettingsState {
  // Multi-tenant data
  settingsByTenant: Record<string, UserSettings>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;

  // Actions
  fetchSettings: (tenantId: string) => Promise<void>;
  updateNotificationsEnabled: (tenantId: string, enabled: boolean) => Promise<void>;
  setTheme: (tenantId: string, theme: ThemeMode) => void;

  // Selectors
  getSettings: (tenantId: string) => UserSettings | null;
  getTheme: (tenantId: string) => ThemeMode;
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: true,
  theme: 'auto',
};

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'auto' || value === 'light' || value === 'dark';

const normalizeSettings = (settings?: Partial<UserSettings>): UserSettings => {
  const theme = settings?.theme;
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    theme: isThemeMode(theme) ? theme : DEFAULT_SETTINGS.theme,
  };
};

const normalizeSettingsByTenant = (
  settingsByTenant: Record<string, UserSettings>
): Record<string, UserSettings> => {
  const normalized: Record<string, UserSettings> = {};
  Object.entries(settingsByTenant).forEach(([tenantId, settings]) => {
    normalized[tenantId] = normalizeSettings(settings);
  });
  return normalized;
};

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      settingsByTenant: {},
      loadingByTenant: {},
      errorsByTenant: {},

      // === Fetch Settings ===
      fetchSettings: async (tenantId: string) => {
        // Prevent duplicate loading
        if (get().loadingByTenant[tenantId]) {
          return;
        }

        set((state) => ({
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
          errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        }));

        try {
          const telegramSettings = await getTelegramSettings(tenantId);

          // Merge with the latest settings (preserve locally changed theme)
          set((state) => {
            const currentSettings = state.settingsByTenant[tenantId];
            const updatedSettings = normalizeSettings({
              ...currentSettings,
              notificationsEnabled: telegramSettings.notificationsEnabled,
            });

            return {
              settingsByTenant: {
                ...state.settingsByTenant,
                [tenantId]: updatedSettings,
              },
              loadingByTenant: {
                ...state.loadingByTenant,
                [tenantId]: false,
              },
              errorsByTenant: {
                ...state.errorsByTenant,
                [tenantId]: null,
              },
            };
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Ошибка при загрузке настроек';
          set((state) => ({
            loadingByTenant: {
              ...state.loadingByTenant,
              [tenantId]: false,
            },
            errorsByTenant: {
              ...state.errorsByTenant,
              [tenantId]: errorMessage,
            },
          }));

          if (process.env.NODE_ENV === 'development') {
            console.error('[UserSettingsStore] Fetch error:', err);
          }
        }
      },

      // === Update Notifications Enabled ===
      updateNotificationsEnabled: async (tenantId: string, enabled: boolean) => {
        const state = get();
        const currentSettings = normalizeSettings(state.settingsByTenant[tenantId]);

        // Optimistic update
        const updatedSettings: UserSettings = {
          ...currentSettings,
          notificationsEnabled: enabled,
        };

        set((state) => ({
          settingsByTenant: {
            ...state.settingsByTenant,
            [tenantId]: updatedSettings,
          },
          loadingByTenant: {
            ...state.loadingByTenant,
            [tenantId]: true,
          },
        }));

        try {
          await updateTelegramSettings(tenantId, { notificationsEnabled: enabled });

          set((state) => ({
            loadingByTenant: {
              ...state.loadingByTenant,
              [tenantId]: false,
            },
            errorsByTenant: {
              ...state.errorsByTenant,
              [tenantId]: null,
            },
          }));
        } catch (err) {
          // Rollback on error
          set((state) => ({
            settingsByTenant: {
              ...state.settingsByTenant,
              [tenantId]: currentSettings,
            },
            loadingByTenant: {
              ...state.loadingByTenant,
              [tenantId]: false,
            },
            errorsByTenant: {
              ...state.errorsByTenant,
              [tenantId]:
                err instanceof Error
                  ? err.message
                  : 'Ошибка при обновлении настроек',
            },
          }));

          if (process.env.NODE_ENV === 'development') {
            console.error('[UserSettingsStore] Update error:', err);
          }

          throw err;
        }
      },

      // === Set Theme ===
      setTheme: (tenantId: string, theme: ThemeMode) => {
        const state = get();
        const currentSettings = normalizeSettings(state.settingsByTenant[tenantId]);

        const updatedSettings: UserSettings = {
          ...currentSettings,
          theme,
        };

        set((state) => ({
          settingsByTenant: {
            ...state.settingsByTenant,
            [tenantId]: updatedSettings,
          },
        }));
      },

      // === Selectors ===
      getSettings: (tenantId: string) => {
        const state = get();
        const settings = state.settingsByTenant[tenantId];
        return settings ? normalizeSettings(settings) : null;
      },

      getTheme: (tenantId: string) => {
        const state = get();
        const settings = state.settingsByTenant[tenantId];
        return normalizeSettings(settings).theme;
      },
    }),
    {
      name: 'user-settings-store',
      version: 1,
      partialize: (state) => ({
        settingsByTenant: state.settingsByTenant,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        let nextSettingsByTenant: Record<string, UserSettings> =
          state.settingsByTenant ?? {};
        let migratedTheme: ThemeMode | undefined;

        // Migrate theme from old useThemeStore (key: 'theme_mode')
        try {
          const oldThemeData = localStorage.getItem('theme_mode');
          if (oldThemeData) {
            const parsed = JSON.parse(oldThemeData);
            const oldTheme = parsed?.state?.mode as ThemeMode | undefined;

            if (oldTheme && isThemeMode(oldTheme)) {
              const updatedSettingsByTenant = { ...nextSettingsByTenant };
              const tenants = Object.keys(updatedSettingsByTenant);

              if (tenants.length > 0) {
                tenants.forEach((tenantId) => {
                  const settings = updatedSettingsByTenant[tenantId];
                  if (!isThemeMode(settings?.theme)) {
                    updatedSettingsByTenant[tenantId] = {
                      ...settings,
                      theme: oldTheme,
                    };
                    migratedTheme = oldTheme;
                  }
                });
              }

              nextSettingsByTenant = updatedSettingsByTenant;

              // Remove old key after migration
              localStorage.removeItem('theme_mode');

              if (process.env.NODE_ENV === 'development') {
                console.log('[UserSettingsStore] Migrated theme from old store:', oldTheme);
              }
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[UserSettingsStore] Migration error:', err);
          }
        }

        // Update state directly
        state.settingsByTenant = normalizeSettingsByTenant(nextSettingsByTenant);
        state.loadingByTenant = {};
        state.errorsByTenant = {};

        if (migratedTheme && process.env.NODE_ENV === 'development') {
          console.log('[UserSettingsStore] Applied migrated theme:', migratedTheme);
        }
      },
    }
  )
);
