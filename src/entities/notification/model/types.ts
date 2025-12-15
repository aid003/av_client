// Notification types
export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Main Notification entity
export interface Notification {
  id: string; // CUID
  tenantId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isDismissible: boolean;
  isRead: boolean;
  isDismissed: boolean;
  readAt: string | null;
  dismissedAt: string | null;
  metadata: Record<string, unknown> | null;
  actionUrl: string | null;
  actionLabel: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// API Query params
export interface NotificationListParams {
  type?: NotificationType;
  unreadOnly?: boolean;
  activeOnly?: boolean;
  page?: number;
  perPage?: number;
}

// API Response
export interface NotificationListResponse {
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
  data: Notification[];
}

// API DTOs (for creating notifications, if needed)
export interface CreateNotificationDto {
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  isDismissible?: boolean;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string | null;
}
