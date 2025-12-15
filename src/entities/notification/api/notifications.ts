import { apiClient } from '@/shared/api/client';
import type {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  CreateNotificationDto,
} from '../model/types';

/**
 * Get list of notifications for a tenant with optional filters
 */
export async function getNotifications(
  tenantId: string,
  params?: NotificationListParams
): Promise<NotificationListResponse> {
  // Filter out undefined values to prevent them from being sent as "undefined" strings
  const cleanedParams = params
    ? Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>)
    : {};

  return apiClient.get<NotificationListResponse>('/api/notifications', {
    tenantId,
    ...cleanedParams,
  });
}

/**
 * Get notification details by ID
 */
export async function getNotificationById(
  tenantId: string,
  id: string
): Promise<Notification> {
  return apiClient.get<Notification>(`/api/notifications/${id}`, {
    tenantId,
  });
}

/**
 * Create a new notification
 */
export async function createNotification(
  tenantId: string,
  data: CreateNotificationDto,
  initData?: string
): Promise<Notification> {
  const headers: Record<string, string> = {};
  if (initData) {
    headers['x-telegram-init-data'] = initData;
  }

  return apiClient.post<Notification>('/api/notifications', data, {
    params: { tenantId },
    headers,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  tenantId: string,
  id: string
): Promise<Notification> {
  return apiClient.patch<Notification>(`/api/notifications/${id}/read`, undefined, {
    params: { tenantId },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(tenantId: string): Promise<void> {
  return apiClient.patch<void>('/api/notifications/read-all', undefined, {
    params: { tenantId },
  });
}

/**
 * Dismiss a notification (close it)
 */
export async function dismissNotification(
  tenantId: string,
  id: string
): Promise<Notification> {
  return apiClient.patch<Notification>(`/api/notifications/${id}/dismiss`, undefined, {
    params: { tenantId },
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  tenantId: string,
  id: string
): Promise<void> {
  return apiClient.delete<void>(`/api/notifications/${id}`, undefined, {
    params: { tenantId },
  });
}
