'use client';

import { useEffect, useState, useCallback } from 'react';
import { ToastNotification } from './ToastNotification';
import { subscribeToNewNotifications } from '@/entities/notification';
import type { Notification } from '@/entities/notification';

interface ToastState {
  id: string;
  notification: Notification;
  timestamp: number;
}

const MAX_TOASTS = 3;

/**
 * Контейнер для показа toast уведомлений
 *
 * Логика:
 * 1. Подписывается на событие 'notification:new' из store
 * 2. При получении нового уведомления проверяет, нужно ли показать тост
 * 3. Добавляет тост в очередь (максимум 3 одновременно)
 * 4. Автоматически удаляет dismissible тосты через 7 секунд
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Проверка, нужно ли показывать тост для уведомления
  const shouldShowToast = useCallback((notification: Notification): boolean => {
    // Не показываем dismissed уведомления
    if (notification.isDismissed) {
      return false;
    }

    // Не показываем истекшие уведомления
    if (notification.expiresAt && new Date(notification.expiresAt) <= new Date()) {
      return false;
    }

    return true;
  }, []);

  // Добавить новый тост
  const addToast = useCallback((notification: Notification) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] Adding toast:', {
        id: notification.id,
        title: notification.title,
        type: notification.type,
      });
    }

    setToasts((prev) => {
      // Проверяем, не показываем ли уже этот тост
      const alreadyShown = prev.some((t) => t.id === notification.id);
      if (alreadyShown) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ToastContainer] Toast already shown, skipping:', notification.id);
        }
        return prev;
      }

      const newToast: ToastState = {
        id: notification.id,
        notification,
        timestamp: Date.now(),
      };

      // Добавляем новый тост и сортируем
      const allToasts = [...prev, newToast];

      // Сортировка: неотклоняемые (isDismissible: false) сначала, потом по времени
      const sorted = allToasts.sort((a, b) => {
        // Неотклоняемые всегда в начале
        if (a.notification.isDismissible !== b.notification.isDismissible) {
          return a.notification.isDismissible ? 1 : -1;
        }
        // Новые сверху
        return b.timestamp - a.timestamp;
      });

      // Ограничиваем количество тостов
      // Неотклоняемые всегда показываются, остальные - до лимита
      const nonDismissible = sorted.filter((t) => !t.notification.isDismissible);
      const dismissible = sorted.filter((t) => t.notification.isDismissible);
      const limited = [
        ...nonDismissible,
        ...dismissible.slice(0, Math.max(0, MAX_TOASTS - nonDismissible.length)),
      ];

      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] Updated toasts:', {
          total: limited.length,
          nonDismissible: nonDismissible.length,
          dismissible: limited.length - nonDismissible.length,
        });
      }

      return limited;
    });
  }, []);

  // Подписка на новые уведомления
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] Subscribing to new notifications');
    }

    const unsubscribe = subscribeToNewNotifications((notification) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] Received new notification event:', {
          id: notification.id,
          title: notification.title,
        });
      }

      if (shouldShowToast(notification)) {
        addToast(notification);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ToastContainer] Notification should not be shown as toast:', notification.id);
        }
      }
    });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ToastContainer] Unsubscribing from new notifications');
      }
      unsubscribe();
    };
  }, [shouldShowToast, addToast]);

  // Удалить тост
  const handleDismiss = useCallback((id: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ToastContainer] Dismissing toast:', id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 top-28 md:top-16"
    >
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
