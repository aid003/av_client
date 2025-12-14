'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/entities/notification';
import { NotificationListItem } from './NotificationListItem';
import { Loader2, Bell } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';

interface NotificationsListProps {
  tenantId: string;
}

export function NotificationsList({ tenantId }: NotificationsListProps) {
  const {
    getNotificationsByTenant,
    fetchNotifications,
    loadingByTenant,
    errorsByTenant,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationStore();

  const notifications = getNotificationsByTenant(tenantId);
  const isLoading = loadingByTenant[tenantId] ?? false;
  const error = errorsByTenant[tenantId];
  const unreadCount = getUnreadCount(tenantId);

  // Загрузка при монтировании (если данных ещё нет)
  // Глобальный polling уже происходит в useNotificationSync
  useEffect(() => {
    if (notifications.length === 0 && !isLoading) {
      fetchNotifications(tenantId, {
        activeOnly: true,
        perPage: 100,
      });
    }
  }, [tenantId, fetchNotifications, notifications.length, isLoading]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(tenantId);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Фильтр активных уведомлений
  const activeNotifications = notifications.filter((n) => {
    if (n.isDismissed) return false;
    if (n.expiresAt) {
      return new Date(n.expiresAt) > new Date();
    }
    return true;
  });

  // Сортировка: новые сверху
  const sortedNotifications = [...activeNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchNotifications(tenantId)}
        >
          Повторить попытку
        </Button>
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">
          Нет уведомлений
        </h2>
        <p className="text-sm text-muted-foreground">
          У вас пока нет уведомлений
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Заголовок с кнопкой "Прочитать все" */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between pb-2 border-b">
          <p className="text-sm text-muted-foreground">
            Непрочитанных: {unreadCount}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            Прочитать все
          </Button>
        </div>
      )}

      {/* Список уведомлений */}
      <div className="space-y-3">
        {sortedNotifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            tenantId={tenantId}
          />
        ))}
      </div>
    </div>
  );
}
