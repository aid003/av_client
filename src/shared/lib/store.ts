import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TelegramAuthResponse } from '@/shared/types/telegram';

// ========== Auth Store ==========
interface AuthState {
  authData: TelegramAuthResponse | null;
  isAuthenticating: boolean;
  setAuthData: (data: TelegramAuthResponse | null) => void;
  setAuthenticating: (isAuthenticating: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  authData: null,
  isAuthenticating: true, // Начинаем с true, чтобы показать загрузку
  setAuthData: (data) => set({ authData: data, isAuthenticating: false }),
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
  clearAuth: () => set({ authData: null }),
}));

// ========== Theme Store ==========
export type ThemeMode = "light" | "dark" | "auto";

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

