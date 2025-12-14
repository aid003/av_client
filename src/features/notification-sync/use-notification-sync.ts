'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotificationStore } from '@/entities/notification';
import { useNotificationSSE } from '@/features/notification-sse';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';

const POLLING_INTERVAL = 30000; // 30 seconds
const SSE_RETRY_THRESHOLD = 3; // После 3 неудачных попыток SSE → fallback на polling

export function useNotificationSync() {
  const { tenantId } = useTelegramAuth();
  const { fetchNotifications } = useNotificationStore();
  const [usePolling, setUsePolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!tenantId) {
      return;
    }

    fetchNotifications(tenantId, {
      activeOnly: true,
      perPage: 100,
    });
  }, [tenantId, fetchNotifications]);

  // SSE connection
  const sseResult = useNotificationSSE({
    tenantId,
    enabled: !usePolling, // Disable SSE if polling is active
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Notification Sync] SSE error:', error);
      }
    },
  });

  // Fallback to polling if SSE fails
  useEffect(() => {
    if (sseResult.retryCount >= SSE_RETRY_THRESHOLD && sseResult.status === 'error') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Notification Sync] SSE failed multiple times, falling back to polling');
      }
      setUsePolling(true);
    }
  }, [sseResult.retryCount, sseResult.status]);

  // Polling setup (only if SSE failed)
  useEffect(() => {
    if (!tenantId || !usePolling) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Notification Sync] Starting polling...');
    }

    intervalRef.current = setInterval(() => {
      fetchNotifications(tenantId, {
        activeOnly: true,
        perPage: 100,
      });
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tenantId, usePolling, fetchNotifications]);

  // Recovery: Try SSE again if it becomes available
  useEffect(() => {
    if (usePolling && sseResult.status === 'connected') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Notification Sync] SSE recovered, disabling polling');
      }
      setUsePolling(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [usePolling, sseResult.status]);

  return {
    sseStatus: sseResult.status,
    isPolling: usePolling,
  };
}
