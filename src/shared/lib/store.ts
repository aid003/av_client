import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TelegramAuthResponse } from '@/shared/types/telegram';

// ========== Auth Store ==========
interface AuthState {
  authData: TelegramAuthResponse | null;
  setAuthData: (data: TelegramAuthResponse | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authData: null,
      setAuthData: (data) => set({ authData: data }),
      clearAuth: () => set({ authData: null }),
    }),
    {
      name: 'telegram_auth',
    }
  )
);

// ========== Theme Store ==========
export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme_mode',
    }
  )
);

