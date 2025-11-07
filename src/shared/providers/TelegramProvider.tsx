'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { init, initData, retrieveLaunchParams } from '@tma.js/sdk-react';

interface TelegramContextValue {
  isInitialized: boolean;
  initData: string | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  isInitialized: false,
  initData: null,
});

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram должен использоваться внутри TelegramProvider');
  }
  return context;
}

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [rawInitData, setRawInitData] = useState<string | null>(null);

  useEffect(() => {
    try {
      // ВАЖНО: Инициализируем весь SDK
      init();
      
      // Восстанавливаем состояние initData
      initData.restore();
      
      // Получаем raw строку initData основным способом
      const raw = initData.raw();
      // Резервный способ через retrieveLaunchParams (по документации)
      const lp = retrieveLaunchParams();
      const fallbackRaw = lp.initDataRaw;

      if (process.env.NODE_ENV === 'development') {
        // Минимальная информация в dev
        // eslint-disable-next-line no-console
        console.log('SDK initialized, initData present:', Boolean(raw ?? fallbackRaw));
      }

      const effectiveRaw = raw ?? (typeof fallbackRaw === 'string' ? fallbackRaw : null);
      if (effectiveRaw) {
        setRawInitData(effectiveRaw);
      } else {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('initData is empty');
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('SDK init error:', error);
      }
      setIsInitialized(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ isInitialized, initData: rawInitData }}>
      {children}
    </TelegramContext.Provider>
  );
}

