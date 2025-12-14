'use client';

import { useEffect, useState, useRef } from 'react';
import { ToastNotification } from './ToastNotification';
import { useNotificationStore } from '@/entities/notification';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import type { Notification } from '@/entities/notification';

interface ToastState {
  id: string;
  notification: Notification;
  timestamp: number;
}

const MAX_TOASTS = 3;
const TIME_WINDOW_MS = 10000; // 10 seconds window for edge cases

export function ToastContainer() {
  const { tenantId } = useTelegramAuth();
  const { notificationsByTenant, lastFetchedAtByTenant, lastNotificationAddedAtByTenant } = useNotificationStore();
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const shownIdsRef = useRef<Set<string>>(new Set());
  const prevLastFetchedRef = useRef<number | null>(null);
  const prevLastAddedRef = useRef<number | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Clear all state when tenant changes
  useEffect(() => {
    shownIdsRef.current.clear();
    prevLastFetchedRef.current = null;
    prevLastAddedRef.current = null;
    initializedRef.current = false;
    setToasts([]);

    // Cleanup: clear refs on unmount (fixes Strict Mode double mount issue)
    return () => {
      shownIdsRef.current.clear();
      prevLastFetchedRef.current = null;
      prevLastAddedRef.current = null;
      initializedRef.current = false;
    };
  }, [tenantId]);

  // Handle new notifications from both SSE and polling
  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const notifications = notificationsByTenant[tenantId] || [];
    const lastFetched = lastFetchedAtByTenant[tenantId];
    const lastAdded = lastNotificationAddedAtByTenant[tenantId];
    const prevLastFetched = prevLastFetchedRef.current;
    const prevLastAdded = prevLastAddedRef.current;

    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] Effect triggered:', {
        tenantId,
        notificationsCount: notifications.length,
        lastFetched,
        lastAdded,
        prevLastFetched,
        prevLastAdded,
      });
    }

    // First load - initialize refs but don't show toasts
    if (!initializedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] First mount - initializing refs');
      }
      if (lastFetched !== null && lastFetched !== undefined) {
        prevLastFetchedRef.current = lastFetched;
      }
      if (lastAdded !== null && lastAdded !== undefined) {
        prevLastAddedRef.current = lastAdded;
      }
      initializedRef.current = true;
      return;
    }

    // Determine trigger source and timestamp
    let triggerTimestamp: number | null = null;
    let triggerSource: 'fetch' | 'add' | null = null;

    // Check if fetched timestamp changed (polling)
    if (lastFetched !== null && lastFetched !== undefined && lastFetched !== prevLastFetched) {
      triggerTimestamp = lastFetched;
      triggerSource = 'fetch';
    }

    // Check if added timestamp changed (SSE) - takes precedence if more recent
    if (lastAdded !== null && lastAdded !== undefined && lastAdded !== prevLastAdded) {
      if (triggerTimestamp === null || lastAdded > triggerTimestamp) {
        triggerTimestamp = lastAdded;
        triggerSource = 'add';
      }
    }

    // No changes detected
    if (triggerTimestamp === null || triggerSource === null) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] No changes detected - exiting');
      }
      return;
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ToastContainer] Triggered by ${triggerSource} at ${triggerTimestamp}`);
    }

    // Filter active notifications
    const activeNotifications = notifications.filter((n) => {
      if (n.isDismissed) return false;
      if (n.expiresAt) {
        return new Date(n.expiresAt) > new Date();
      }
      return true;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] Active notifications:', activeNotifications.length);
    }

    // Find new notifications based on trigger timestamp
    const referenceTimestamp = triggerSource === 'fetch' ? prevLastFetched : prevLastAdded;
    const newNotifications = activeNotifications.filter((n) => {
      const createdAt = new Date(n.createdAt).getTime();
      return createdAt > (referenceTimestamp || 0) - TIME_WINDOW_MS;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] New notifications to show:', {
        count: newNotifications.length,
        referenceTimestamp,
        notifications: newNotifications.map(n => ({
          id: n.id,
          title: n.title,
          createdAt: n.createdAt,
        })),
      });

      // Expose debug helpers
      (window as any).debugToasts = {
        clearShownIds: () => {
          shownIdsRef.current.clear();
          console.log('[ToastContainer] Cleared shownIds');
        },
        resetRefs: () => {
          prevLastFetchedRef.current = null;
          prevLastAddedRef.current = null;
          initializedRef.current = false;
          console.log('[ToastContainer] Reset refs');
        },
        showState: () => {
          console.log('[ToastContainer] State:', {
            toasts: toasts.length,
            shownIds: Array.from(shownIdsRef.current),
            prevLastFetched: prevLastFetchedRef.current,
            prevLastAdded: prevLastAddedRef.current,
            initialized: initializedRef.current,
          });
        },
      };
    }

    // Add new toasts
    setToasts((currentToasts) => {
      const existingIds = new Set(currentToasts.map((t) => t.id));
      const shownIds = shownIdsRef.current;

      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] Current state:', {
          currentToasts: currentToasts.length,
          existingIds: Array.from(existingIds),
          shownIds: Array.from(shownIds),
        });
      }

      const toAdd = newNotifications
        .filter((n) => !existingIds.has(n.id) && !shownIds.has(n.id))
        .map((n) => ({
          id: n.id,
          notification: n,
          timestamp: Date.now(),
        }));

      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] Toasts to add:', {
          count: toAdd.length,
          toasts: toAdd.map(t => ({ id: t.id, title: t.notification.title })),
        });
      }

      // Mark as shown
      toAdd.forEach((toast) => {
        shownIds.add(toast.id);
      });

      if (toAdd.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ToastContainer] No new toasts to add');
        }
        return currentToasts;
      }

      // Combine and sort
      const combined = [...currentToasts, ...toAdd];
      const sorted = combined.sort((a, b) => {
        if (a.notification.isDismissible !== b.notification.isDismissible) {
          return a.notification.isDismissible ? 1 : -1;
        }
        return b.timestamp - a.timestamp;
      });

      // Limit to MAX_TOASTS
      const nonDismissible = sorted.filter((t) => !t.notification.isDismissible);
      const dismissible = sorted.filter((t) => t.notification.isDismissible);
      const limited = [
        ...nonDismissible,
        ...dismissible.slice(0, Math.max(0, MAX_TOASTS - nonDismissible.length)),
      ];

      return limited;
    });

    // Update refs
    if (triggerSource === 'fetch') {
      prevLastFetchedRef.current = lastFetched;
    } else if (triggerSource === 'add') {
      prevLastAddedRef.current = lastAdded;
    }
  }, [tenantId, notificationsByTenant, lastFetchedAtByTenant, lastNotificationAddedAtByTenant]);

  // Remove toasts for notifications that are no longer active
  useEffect(() => {
    if (!tenantId) {
      return;
    }

    const notifications = notificationsByTenant[tenantId] || [];
    const activeIds = new Set(
      notifications
        .filter((n) => {
          if (n.isDismissed) return false;
          if (n.expiresAt) {
            return new Date(n.expiresAt) > new Date();
          }
          return true;
        })
        .map((n) => n.id)
    );

    setToasts((currentToasts) => {
      return currentToasts.filter((t) => activeIds.has(t.id));
    });
  }, [tenantId, notificationsByTenant]);

  const handleDismiss = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    // Mark as shown so it won't appear again
    shownIdsRef.current.add(id);
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          notification={toast.notification}
          onDismiss={() => handleDismiss(toast.id)}
          autoHideDelay={toast.notification.isDismissible ? 7000 : 0}
        />
      ))}
    </div>
  );
}
