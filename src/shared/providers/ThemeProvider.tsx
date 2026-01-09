'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { useTelegram } from './TelegramProvider';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { useUserSettingsStore } from '@/entities/user-settings';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isInitialized, colorScheme: telegramColorScheme } = useTelegram();
  const { authData } = useTelegramAuth();
  const tenantId = authData?.tenant.id;
  const mode = useUserSettingsStore(
    useCallback(
      (state) =>
        tenantId ? state.settingsByTenant[tenantId]?.theme ?? 'auto' : 'auto',
      [tenantId]
    )
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const effectiveTheme = mode === 'auto' ? telegramColorScheme : mode;
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Theme applied: mode=${mode}, telegram=${telegramColorScheme}, effective=${effectiveTheme}`);
    }
  }, [isInitialized, mode, telegramColorScheme]);

  return <>{children}</>;
}
