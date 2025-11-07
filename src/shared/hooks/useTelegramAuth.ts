'use client';

import { useEffect, useState } from 'react';
import type { TelegramAuthResponse } from '@/shared/types/telegram';

export function useTelegramAuth() {
  const [authData, setAuthData] = useState<TelegramAuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('telegram_auth');
      if (stored) {
        const data = JSON.parse(stored) as TelegramAuthResponse;
        setAuthData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных авторизации:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { authData, isLoading };
}

