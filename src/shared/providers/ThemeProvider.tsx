'use client';

import { useEffect, type ReactNode } from 'react';
import { useTelegram } from './TelegramProvider';
import { useThemeStore } from '@/shared/lib/store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isInitialized, colorScheme: telegramColorScheme } = useTelegram();
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // Определяем итоговую тему
    const effectiveTheme = mode === 'auto' ? telegramColorScheme : mode;
    
    // Применяем класс к document.documentElement
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

