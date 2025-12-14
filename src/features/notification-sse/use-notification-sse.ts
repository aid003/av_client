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

export function useNotificationSSE(options: UseNotificationSSEOptions): UseNotificationSSEResult {
  const { tenantId, enabled = true, onError } = options;
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(INITIAL_RETRY_DELAY);

  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!tenantId || !enabled) {
      setStatus('disconnected');
      return;
    }

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const url = `${config.apiBaseUrl}/api/notifications/stream?tenantId=${tenantId}`;

      setStatus('connecting');
      setError(null);

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        setStatus('connected');
        setError(null);
        setRetryCount(0);
        retryDelayRef.current = INITIAL_RETRY_DELAY;

        if (process.env.NODE_ENV === 'development') {
          console.log('[SSE] Connected to notifications stream');
        }
      });

      es.addEventListener('notification', (event) => {
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

          addNotification(tenantId, notification);

          if (process.env.NODE_ENV === 'development') {
            console.log('[SSE] addNotification called for:', notification.id);
          }
        } catch (err) {
          console.error('[SSE] Failed to parse notification:', err);
        }
      });

      es.addEventListener('error', (event: Event) => {
        console.error('[SSE] Connection error:', event);

        const errorMsg = 'SSE connection error';
        setError(errorMsg);
        setStatus('error');

        if (onError) {
          onError(new Error(errorMsg));
        }

        es.close();
        eventSourceRef.current = null;

        // Retry with exponential backoff
        setRetryCount((prev) => prev + 1);
        const delay = retryDelayRef.current;
        retryDelayRef.current = Math.min(delay * 2, MAX_RETRY_DELAY);

        if (process.env.NODE_ENV === 'development') {
          console.log(`[SSE] Retrying in ${delay}ms...`);
        }

        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      });
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [tenantId, enabled, addNotification, onError]);

  return { status, error, retryCount };
}
