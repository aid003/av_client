'use client';

import { useEffect, useState, useRef } from 'react';
import { config } from '@/shared/lib/config';
import { useNotificationStore } from '@/entities/notification';
import type { Notification } from '@/entities/notification';

export interface UseNotificationSSEResult {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  retryCount: number;
}

export interface UseNotificationSSEOptions {
  tenantId: string | undefined;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 60000; // 60 seconds
const MAX_RETRY_COUNT = 10; // Максимум 10 попыток переподключения
const HEARTBEAT_TIMEOUT = 60000; // 60 секунд без событий → reconnect

/**
 * Hook для SSE (Server-Sent Events) подключения к потоку уведомлений
 *
 * Особенности:
 * - Автоматическое переподключение с exponential backoff
 * - Heartbeat проверка (если нет событий 60 сек → reconnect)
 * - Максимум 10 попыток переподключения
 * - Обработка keep-alive сообщений от сервера
 */
export function useNotificationSSE(options: UseNotificationSSEOptions): UseNotificationSSEResult {
  const { tenantId, enabled = true, onError } = options;
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);

  const { addNotification } = useNotificationStore();

  // Сброс heartbeat таймера
  const resetHeartbeat = useRef(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SSE] No events for 60 seconds, reconnecting...');
      }

      // Переподключение при отсутствии событий
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setStatus('connecting');
      // Триггерим reconnect через изменение retryCount
      setRetryCount((prev) => prev + 1);
    }, HEARTBEAT_TIMEOUT);
  });

  useEffect(() => {
    if (!tenantId || !enabled) {
      setStatus('disconnected');
      return;
    }

    // Если достигли максимума попыток, не переподключаемся
    if (retryCount >= MAX_RETRY_COUNT) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[SSE] Max retry count reached, giving up');
      }
      setStatus('error');
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    const connect = () => {
      // Закрываем предыдущее соединение если есть
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Очищаем таймеры
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }

      const url = `${config.apiBaseUrl}/api/notifications/stream?tenantId=${tenantId}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('[SSE] Connecting to:', url);
      }

      setStatus('connecting');
      setError(null);

      const es = new EventSource(url);
      eventSourceRef.current = es;

      // Обработчик открытия соединения
      es.addEventListener('open', () => {
        setStatus('connected');
        setError(null);
        setRetryCount(0);
        retryDelayRef.current = INITIAL_RETRY_DELAY;

        // Запускаем heartbeat
        resetHeartbeat.current();

        if (process.env.NODE_ENV === 'development') {
          console.log('[SSE] Connected to notifications stream');
        }
      });

      // Обработчик уведомлений
      es.addEventListener('notification', (event) => {
        // Сброс heartbeat при любом событии
        resetHeartbeat.current();

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('[SSE] Received notification event, raw data:', event.data);
          }

          const notification: Notification = JSON.parse(event.data);

          if (process.env.NODE_ENV === 'development') {
            console.log('[SSE] Parsed notification:', {
              id: notification.id,
              title: notification.title,
              type: notification.type,
              createdAt: notification.createdAt,
            });
          }

          // Добавляем уведомление в store (это автоматически эмитирует событие)
          addNotification(tenantId, notification);

          if (process.env.NODE_ENV === 'development') {
            console.log('[SSE] addNotification called for:', notification.id);
          }
        } catch (err) {
          console.error('[SSE] Failed to parse notification:', err);
        }
      });

      // Обработчик general message (для keep-alive и других сообщений)
      es.addEventListener('message', (event) => {
        // Сброс heartbeat для keep-alive
        resetHeartbeat.current();

        if (process.env.NODE_ENV === 'development') {
          console.log('[SSE] Received message (keep-alive):', event.data);
        }
      });

      // Обработчик ошибок
      es.addEventListener('error', (event: Event) => {
        console.error('[SSE] Connection error:', event);

        // Очищаем heartbeat
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }

        const errorMsg = 'SSE connection error';
        setError(errorMsg);
        setStatus('error');

        if (onError) {
          onError(new Error(errorMsg));
        }

        es.close();
        eventSourceRef.current = null;

        // Retry с exponential backoff
        const currentRetryCount = retryCount + 1;
        setRetryCount(currentRetryCount);

        if (currentRetryCount < MAX_RETRY_COUNT) {
          const delay = retryDelayRef.current;
          retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);

          if (process.env.NODE_ENV === 'development') {
            console.log(`[SSE] Retrying in ${delay}ms (attempt ${currentRetryCount}/${MAX_RETRY_COUNT})...`);
          }

          retryTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('[SSE] Max retry count reached in error handler');
          }
        }
      });
    };

    connect();

    // Cleanup
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SSE] Cleaning up connection');
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
    };
  }, [tenantId, enabled, addNotification, onError, retryCount]);

  return { status, error, retryCount };
}
