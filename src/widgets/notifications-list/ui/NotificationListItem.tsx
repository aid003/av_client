'use client';

import { useState } from 'react';
import type { Notification } from '@/entities/notification';
import { NotificationIcon } from '@/entities/notification';
import { useNotificationStore } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';
import { ChevronDown, X, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface NotificationListItemProps {
  notification: Notification;
  tenantId: string;
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

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotificationColorClass(type: Notification['type'], isRead: boolean): string {
  const baseClass = isRead
    ? 'bg-muted/30 border-border'
    : 'bg-card border-primary/20';

  if (isRead) return baseClass;

  switch (type) {
    case 'ERROR':
      return 'bg-destructive/5 border-destructive/30';
    case 'WARNING':
      return 'bg-yellow-500/5 border-yellow-500/30';
    case 'SUCCESS':
      return 'bg-green-500/5 border-green-500/30';
    case 'INFO':
      return 'bg-primary/5 border-primary/30';
    case 'SYSTEM':
      return 'bg-muted/50 border-muted-foreground/30';
    default:
      return baseClass;
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

export function NotificationListItem({
  notification,
  tenantId,
}: NotificationListItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { markAsRead, dismissNotification } = useNotificationStore();
  const router = useRouter();

  const isRead = notification.isRead;
  const hasAction = !!notification.actionUrl;

  const handleMarkAsRead = async () => {
    if (isRead) return;
    try {
      await markAsRead(tenantId, notification.id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissNotification(tenantId, notification.id);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleNavigate = () => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setDialogOpen(false);
    }
  };

  const handleClick = () => {
    // При клике открываем диалог и сразу отмечаем прочитанным
    setDialogOpen(true);
    if (!isRead) {
      handleMarkAsRead();
    }
  };

  return (
    <>
      {/* Карточка в списке */}
      <div
        onClick={handleClick}
        className={cn(
          'group relative rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md',
          getNotificationColorClass(notification.type, isRead),
          !isRead && 'ring-1 ring-primary/10'
        )}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="shrink-0 pt-1">
            <NotificationIcon
              type={notification.type}
              className={cn(getIconColorClass(notification.type))}
              size={20}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
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
              <p
                className={cn(
                  'line-clamp-2 text-sm text-muted-foreground',
                  isRead && 'opacity-80'
                )}
              >
                {notification.message}
              </p>
            )}

            {/* Индикатор непрочитанности */}
            {!isRead && (
              <div className="flex items-center gap-1 mt-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-primary font-medium">
                  Непрочитано
                </span>
              </div>
            )}
          </div>

          {/* Chevron hint */}
          <div className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Dialog с деталями */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <NotificationIcon
                type={notification.type}
                className={cn(getIconColorClass(notification.type))}
                size={24}
              />
              <div className="flex-1 min-w-0">
                <DialogTitle>{notification.title}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNotificationTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </DialogHeader>

          {notification.message && (
            <DialogDescription className="text-sm whitespace-pre-wrap">
              {notification.message}
            </DialogDescription>
          )}

          {/* Metadata (если есть) */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="bg-muted/50 rounded-md p-3 text-xs">
              <p className="font-medium mb-2 text-muted-foreground">
                Дополнительная информация:
              </p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div className="flex gap-2">
              {notification.isDismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                >
                  <X className="mr-1 h-4 w-4" />
                  Удалить
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {hasAction && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNavigate}
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  {notification.actionLabel || 'Перейти'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                Закрыть
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
