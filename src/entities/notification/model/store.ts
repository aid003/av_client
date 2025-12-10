import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification, NotificationListParams } from './types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
} from '../api';
import { ERROR_MESSAGES } from '@/shared/lib/error-messages';

interface NotificationState {
  // Notifications by tenant
  notificationsByTenant: Record<string, Notification[]>;
  unreadCountByTenant: Record<string, number>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  lastFetchedAtByTenant: Record<string, number | null>;

  // Actions
  fetchNotifications: (
    tenantId: string,
    params?: NotificationListParams
  ) => Promise<void>;
  markAsRead: (tenantId: string, id: string) => Promise<void>;
  markAllAsRead: (tenantId: string) => Promise<void>;
  dismissNotification: (tenantId: string, id: string) => Promise<void>;
  deleteNotification: (tenantId: string, id: string) => Promise<void>;
  addNotification: (tenantId: string, notification: Notification) => void;
  updateNotification: (tenantId: string, notification: Notification) => void;

  // Selectors (computed values)
  getUnreadNotifications: (tenantId: string) => Notification[];
  getActiveNotifications: (tenantId: string) => Notification[];
  getNotificationsByTenant: (tenantId: string) => Notification[];
  getUnreadCount: (tenantId: string) => number;

  // Clear state
  clearNotifications: (tenantId: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notificationsByTenant: {},
      unreadCountByTenant: {},
      loadingByTenant: {},
      errorsByTenant: {},
      lastFetchedAtByTenant: {},

      // === Fetch Notifications ===
      fetchNotifications: async (
        tenantId: string,
        params?: NotificationListParams
      ) => {
        const state = get();

        // Prevent duplicate loading
        if (state.loadingByTenant[tenantId]) {
          return;
        }

        set((state) => ({
          loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
          errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        }));

        try {
          const response = await getNotifications(tenantId, {
            activeOnly: true, // Always fetch only active notifications
            ...params,
          });

          // Update notifications: replace with fresh data from server
          // Keep existing notifications that are not in the response (they might be dismissed locally)
          const existingNotifications = state.notificationsByTenant[tenantId] || [];
          const responseIds = new Set(response.data.map((n) => n.id));
          const existingNotInResponse = existingNotifications.filter(
            (n) => !responseIds.has(n.id)
          );

          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: [...response.data, ...existingNotInResponse].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ),
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: response.meta.unreadCount,
            },
            lastFetchedAtByTenant: {
              ...state.lastFetchedAtByTenant,
              [tenantId]: Date.now(),
            },
            loadingByTenant: {
              ...state.loadingByTenant,
              [tenantId]: false,
            },
            errorsByTenant: {
              ...state.errorsByTenant,
              [tenantId]: null,
            },
          }));
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Ошибка при загрузке уведомлений';
          set((state) => ({
            loadingByTenant: {
              ...state.loadingByTenant,
              [tenantId]: false,
            },
            errorsByTenant: {
              ...state.errorsByTenant,
              [tenantId]: errorMessage,
            },
          }));

          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationStore] Fetch error:', err);
          }
        }
      },

      // === Mark as Read ===
      markAsRead: async (tenantId: string, id: string) => {
        try {
          const updated = await markNotificationAsRead(tenantId, id);
          const state = get();
          const notifications = state.notificationsByTenant[tenantId] || [];
          const updatedNotifications = notifications.map((n) =>
            n.id === id ? updated : n
          );

          // Recalculate unread count
          const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updatedNotifications,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: unreadCount,
            },
          }));
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationStore] Mark as read error:', err);
          }
          throw err;
        }
      },

      // === Mark All as Read ===
      markAllAsRead: async (tenantId: string) => {
        try {
          await markAllNotificationsAsRead(tenantId);
          const state = get();
          const notifications = state.notificationsByTenant[tenantId] || [];
          const updatedNotifications = notifications.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString(),
          }));

          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updatedNotifications,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: 0,
            },
          }));
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationStore] Mark all as read error:', err);
          }
          throw err;
        }
      },

      // === Dismiss Notification ===
      dismissNotification: async (tenantId: string, id: string) => {
        try {
          await deleteNotificationApi(tenantId, id);
          const state = get();
          const notifications = state.notificationsByTenant[tenantId] || [];
          const updatedNotifications = notifications.filter((n) => n.id !== id);

          // Recalculate unread count
          const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updatedNotifications,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: unreadCount,
            },
          }));
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationStore] Dismiss error:', err);
          }
          throw err;
        }
      },

      // === Delete Notification ===
      deleteNotification: async (tenantId: string, id: string) => {
        try {
          await deleteNotificationApi(tenantId, id);
          const state = get();
          const notifications = state.notificationsByTenant[tenantId] || [];
          const updatedNotifications = notifications.filter((n) => n.id !== id);

          // Recalculate unread count
          const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;

          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updatedNotifications,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: unreadCount,
            },
          }));
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[NotificationStore] Delete error:', err);
          }
          throw err;
        }
      },

      // === Add Notification ===
      addNotification: (tenantId: string, notification: Notification) => {
        const state = get();
        const notifications = state.notificationsByTenant[tenantId] || [];
        const existingIndex = notifications.findIndex((n) => n.id === notification.id);

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...notifications];
          updated[existingIndex] = notification;
          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updated,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: updated.filter((n) => !n.isRead).length,
            },
          }));
        } else {
          // Add new
          const updated = [notification, ...notifications];
          set((state) => ({
            notificationsByTenant: {
              ...state.notificationsByTenant,
              [tenantId]: updated,
            },
            unreadCountByTenant: {
              ...state.unreadCountByTenant,
              [tenantId]: updated.filter((n) => !n.isRead).length,
            },
          }));
        }
      },

      // === Update Notification ===
      updateNotification: (tenantId: string, notification: Notification) => {
        const state = get();
        const notifications = state.notificationsByTenant[tenantId] || [];
        const updated = notifications.map((n) =>
          n.id === notification.id ? notification : n
        );

        set((state) => ({
          notificationsByTenant: {
            ...state.notificationsByTenant,
            [tenantId]: updated,
          },
          unreadCountByTenant: {
            ...state.unreadCountByTenant,
            [tenantId]: updated.filter((n) => !n.isRead).length,
          },
        }));
      },

      // === Selectors ===
      getUnreadNotifications: (tenantId: string) => {
        const state = get();
        const notifications = state.notificationsByTenant[tenantId] || [];
        return notifications.filter((n) => !n.isRead && !n.isDismissed);
      },

      getActiveNotifications: (tenantId: string) => {
        const state = get();
        const notifications = state.notificationsByTenant[tenantId] || [];
        const now = new Date().toISOString();
        return notifications.filter(
          (n) =>
            !n.isDismissed &&
            (!n.expiresAt || new Date(n.expiresAt) > new Date(now))
        );
      },

      getNotificationsByTenant: (tenantId: string) => {
        const state = get();
        return state.notificationsByTenant[tenantId] || [];
      },

      getUnreadCount: (tenantId: string) => {
        const state = get();
        return state.unreadCountByTenant[tenantId] || 0;
      },

      // === Clear ===
      clearNotifications: (tenantId: string) => {
        set((state) => {
          const newNotificationsByTenant = { ...state.notificationsByTenant };
          delete newNotificationsByTenant[tenantId];
          const newUnreadCountByTenant = { ...state.unreadCountByTenant };
          delete newUnreadCountByTenant[tenantId];
          const newLastFetchedAtByTenant = { ...state.lastFetchedAtByTenant };
          delete newLastFetchedAtByTenant[tenantId];

          return {
            notificationsByTenant: newNotificationsByTenant,
            unreadCountByTenant: newUnreadCountByTenant,
            lastFetchedAtByTenant: newLastFetchedAtByTenant,
          };
        });
      },
    }),
    {
      name: 'notifications-store',
      partialize: (state) => ({
        notificationsByTenant: state.notificationsByTenant,
        unreadCountByTenant: state.unreadCountByTenant,
        lastFetchedAtByTenant: state.lastFetchedAtByTenant,
      }),
    }
  )
);
