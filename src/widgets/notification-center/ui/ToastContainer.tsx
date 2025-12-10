'use client';

import { useEffect, useState } from 'react';
import { ToastNotification } from './ToastNotification';
import { useNotificationStore } from '@/entities/notification';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import type { Notification } from '@/entities/notification';

interface ToastState {
  id: string;
  notification: Notification;
  timestamp: number;
}

const MAX_TOASTS = 5;

export function ToastContainer() {
  const { tenantId } = useTelegramAuth();
  const { notificationsByTenant, lastFetchedAtByTenant } = useNotificationStore();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    if (!tenantId) {
      setToasts([]);
      return;
    }

    const notifications = notificationsByTenant[tenantId] || [];
    const lastFetched = lastFetchedAtByTenant[tenantId];

    // Filter active notifications
    const activeNotifications = notifications.filter((n) => {
      if (n.isDismissed) return false;
      if (n.expiresAt) {
        return new Date(n.expiresAt) > new Date();
      }
      return true;
    });

    // If we have a lastFetched timestamp, only show notifications created after it
    // Otherwise show all active notifications (initial load)
    const newNotifications = lastFetched
      ? activeNotifications.filter((n) => {
          const createdAt = new Date(n.createdAt).getTime();
          // Consider notifications created in the last 10 seconds as "new"
          // This handles edge cases where fetch might happen slightly after creation
          return createdAt > lastFetched - 10000;
        })
      : activeNotifications.slice(0, MAX_TOASTS);

    // Add new toasts for notifications we haven't shown yet
    setToasts((currentToasts) => {
      const existingIds = new Set(currentToasts.map((t) => t.id));
      const toAdd = newNotifications
        .filter((n) => !existingIds.has(n.id))
        .slice(0, MAX_TOASTS - currentToasts.length)
        .map((n) => ({
          id: n.id,
          notification: n,
          timestamp: Date.now(),
        }));

      // Limit total toasts and sort by timestamp (newest first)
      const updated = [...toAdd, ...currentToasts]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_TOASTS);

      return updated;
    });
  }, [tenantId, notificationsByTenant, lastFetchedAtByTenant]);

  const handleDismiss = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
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
