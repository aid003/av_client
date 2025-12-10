'use client';

import { NotificationIcon } from '@/entities/notification';
import { Button } from '@/shared/ui/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { Notification } from '@/entities/notification';
import { Check, X, ExternalLink } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  onDismiss?: () => void;
  onNavigate?: () => void;
  className?: string;
}

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'только что';
  }
  if (diffMins < 60) {
    return `${diffMins} мин. назад`;
  }
  if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  }
  if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  }

  // For older notifications, show formatted date
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotificationColorClass(type: Notification['type']): string {
  switch (type) {
    case 'ERROR':
      return 'border-destructive/50 bg-destructive/5';
    case 'WARNING':
      return 'border-yellow-500/50 bg-yellow-500/5';
    case 'SUCCESS':
      return 'border-green-500/50 bg-green-500/5';
    case 'INFO':
      return 'border-primary/50 bg-primary/5';
    case 'SYSTEM':
      return 'border-muted-foreground/50 bg-muted/50';
    default:
      return 'border-border bg-card';
  }
}

function getIconColorClass(type: Notification['type']): string {
  switch (type) {
    case 'ERROR':
      return 'text-destructive';
    case 'WARNING':
      return 'text-yellow-600 dark:text-yellow-500';
    case 'SUCCESS':
      return 'text-green-600 dark:text-green-500';
    case 'INFO':
      return 'text-primary';
    case 'SYSTEM':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onNavigate,
  className,
}: NotificationItemProps) {
  const isRead = notification.isRead;
  const hasAction = !!notification.actionUrl;

  return (
    <div
      className={cn(
        'group relative rounded-lg border p-3 transition-colors',
        getNotificationColorClass(notification.type),
        !isRead && 'ring-1 ring-primary/20',
        className
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="shrink-0 pt-0.5">
          <NotificationIcon
            type={notification.type}
            className={cn(getIconColorClass(notification.type))}
            size={18}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-medium leading-tight',
                !isRead && 'font-semibold'
              )}
            >
              {notification.title}
            </h4>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          {notification.message && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {notification.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {!isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onMarkAsRead}
              >
                <Check className="mr-1 h-3 w-3" />
                Прочитать
              </Button>
            )}

            {notification.isDismissible && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onDismiss}
              >
                <X className="mr-1 h-3 w-3" />
                Закрыть
              </Button>
            )}

            {hasAction && onNavigate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onNavigate}
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                {notification.actionLabel || 'Перейти'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
