import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  /**
   * Интервал polling в миллисекундах
   */
  interval: number;
  /**
   * Обновлять ли данные при фокусе окна
   */
  refreshOnFocus?: boolean;
  /**
   * Запускать ли polling сразу после монтирования
   */
  immediate?: boolean;
  /**
   * Условие для запуска polling (если false, polling не будет работать)
   */
  enabled?: boolean;
}

/**
 * Хук для периодического опроса данных (polling)
 *
 * @param callback - Функция, которая будет вызываться периодически
 * @param options - Настройки polling
 *
 * @example
 * ```tsx
 * const { refresh, isPolling } = usePolling(
 *   async () => {
 *     const data = await fetchData();
 *     setData(data);
 *   },
 *   {
 *     interval: 15000, // 15 секунд
 *     refreshOnFocus: true,
 *     immediate: true,
 *   }
 * );
 * ```
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) {
  const {
    interval,
    refreshOnFocus = true,
    immediate = false,
    enabled = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  const callbackRef = useRef(callback);

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  /**
   * Безопасное выполнение callback с защитой от concurrent calls
   */
  const safeExecute = useCallback(async () => {
    if (isExecutingRef.current || !enabled) return;

    isExecutingRef.current = true;
    try {
      await callbackRef.current();
    } catch (error) {
      // Ошибки должны обрабатываться внутри callback
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('[usePolling] Error during callback execution:', error);
      }
    } finally {
      isExecutingRef.current = false;
    }
  }, [enabled]);

  /**
   * Запуск polling
   */
  const startPolling = useCallback(() => {
    if (!enabled) return;

    // Очищаем предыдущий интервал, если он был
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Устанавливаем новый интервал
    intervalRef.current = setInterval(() => {
      safeExecute();
    }, interval);
  }, [interval, safeExecute, enabled]);

  /**
   * Остановка polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Ручное обновление данных
   */
  const refresh = useCallback(() => {
    safeExecute();
  }, [safeExecute]);

  /**
   * Перезапуск polling (остановка + запуск)
   */
  const restart = useCallback(() => {
    stopPolling();
    startPolling();
  }, [stopPolling, startPolling]);

  // Запускаем polling при монтировании и изменении опций
  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    // Немедленное выполнение, если включено
    if (immediate) {
      safeExecute();
    }

    // Запускаем polling
    startPolling();

    // Очистка при размонтировании
    return () => {
      stopPolling();
    };
  }, [enabled, immediate, startPolling, stopPolling, safeExecute]);

  // Обновление при фокусе окна
  useEffect(() => {
    if (!refreshOnFocus || !enabled) return;

    const handleFocus = () => {
      refresh();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshOnFocus, refresh, enabled]);

  return {
    /**
     * Ручное обновление данных
     */
    refresh,
    /**
     * Запустить polling
     */
    start: startPolling,
    /**
     * Остановить polling
     */
    stop: stopPolling,
    /**
     * Перезапустить polling
     */
    restart,
    /**
     * Активен ли polling в данный момент
     */
    isPolling: intervalRef.current !== null,
  };
}

/**
 * Хук для простого polling с автоматическим управлением загрузкой и ошибками
 */
interface UseSimplePollingOptions<T> extends Omit<UsePollingOptions, 'immediate'> {
  /**
   * Функция для загрузки данных
   */
  fetcher: () => Promise<T>;
  /**
   * Callback при успешной загрузке
   */
  onSuccess?: (data: T) => void;
  /**
   * Callback при ошибке
   */
  onError?: (error: Error) => void;
}

/**
 * Упрощенный хук для polling с автоматической обработкой загрузки
 */
export function useSimplePolling<T>(
  options: UseSimplePollingOptions<T>
) {
  const { fetcher, onSuccess, onError, ...pollingOptions } = options;

  const polling = usePolling(
    async () => {
      try {
        const data = await fetcher();
        onSuccess?.(data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
      }
    },
    { ...pollingOptions, immediate: true }
  );

  return polling;
}
