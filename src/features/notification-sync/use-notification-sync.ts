'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/entities/notification';
import { useNotificationSSE } from '@/features/notification-sse';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { useAppActivityTracker } from './use-app-activity-tracker';

const BACKGROUND_SYNC_INTERVAL = 5 * 60 * 1000; // 5 минут

/**
 * Hook для синхронизации уведомлений
 *
 * Логика:
 * 1. Initial fetch при монтировании
 * 2. SSE соединение для получения уведомлений в реальном времени
 * 3. Background sync каждые 5 минут для обеспечения синхронизации
 *
 * SSE является основным методом получения уведомлений.
 * Background sync используется как страховка на случай пропуска событий.
 */
export function useNotificationSync() {
  const { tenantId } = useTelegramAuth();
  const { fetchNotifications } = useNotificationStore();

  // Track app activity для определения новых уведомлений при возврате
  useAppActivityTracker(tenantId);

  // Initial fetch при монтировании
  useEffect(() => {
    if (!tenantId) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Notification Sync] Initial fetch for tenant:', tenantId);
    }

    fetchNotifications(tenantId, {
      activeOnly: true,
      perPage: 100,
    });
  }, [tenantId, fetchNotifications]);

  // SSE connection (основной метод получения уведомлений)
  const sseResult = useNotificationSSE({
    tenantId,
    enabled: true,
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Notification Sync] SSE error:', error);
      }
    },
  });

  // Background sync каждые 5 минут
  useEffect(() => {
    if (!tenantId) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Notification Sync] Starting background sync (every 5 minutes)');
    }

    const interval = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Notification Sync] Background sync triggered');
      }

      fetchNotifications(tenantId, {
        activeOnly: true,
        perPage: 100,
      });
    }, BACKGROUND_SYNC_INTERVAL);

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Notification Sync] Stopping background sync');
      }
      clearInterval(interval);
    };
  }, [tenantId, fetchNotifications]);

  // Логирование статуса SSE
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Notification Sync] SSE status:', {
        status: sseResult.status,
        error: sseResult.error,
        retryCount: sseResult.retryCount,
      });
    }
  }, [sseResult.status, sseResult.error, sseResult.retryCount]);

  return {
    sseStatus: sseResult.status,
    sseError: sseResult.error,
    sseRetryCount: sseResult.retryCount,
  };
}
