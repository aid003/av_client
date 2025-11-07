'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTelegram } from './TelegramProvider';
import { authenticateTelegram, UserBlockedError } from '@/shared/lib/api/telegram';
import type { TelegramAuthResponse } from '@/shared/types/telegram';

interface AuthProxyProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
}

export function AuthProxy({ children, loadingComponent }: AuthProxyProps) {
  const { isInitialized, initData } = useTelegram();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authData, setAuthData] = useState<TelegramAuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    async function authenticate() {
      try {
        if (!initData) {
          setError('Отсутствуют initData. Откройте приложение через Telegram Mini App.');
          return; // Не разблокируем контент, показываем ошибку
        }

        const response = await authenticateTelegram(initData);
        setAuthData(response);
        
        // Сохраняем данные пользователя в localStorage для дальнейшего использования
        if (typeof window !== 'undefined') {
          localStorage.setItem('telegram_auth', JSON.stringify(response));
        }
      } catch (err) {
        if (err instanceof UserBlockedError) {
          setBlockedReason(err.reason);
          setError(null);
          return;
        }
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Auth error:', errorMessage);
        }
        setError(errorMessage);
      } finally {
        setIsAuthenticating(false);
      }
    }

    authenticate();
  }, [isInitialized, initData, retryCount]);

  if (isAuthenticating) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
              <p className="text-lg">Авторизация...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (blockedReason) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <p className="text-xl font-semibold mb-2">Ваш аккаунт заблокирован</p>
          <p className="text-sm text-gray-600 mb-4">
            {blockedReason}
          </p>
          <p className="text-xs text-gray-500">Если вы считаете, что это ошибка, обратитесь в поддержку.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Ошибка авторизации</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
            onClick={() => {
              setError(null);
              setIsAuthenticating(true);
              setRetryCount((c) => c + 1);
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

