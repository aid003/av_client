'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { NotificationIcon } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';
import type { Notification } from '@/entities/notification';
import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToastNotificationProps {
  notification: Notification;
  onDismiss: () => void;
  autoHideDelay?: number;
}

function getNotificationColorClass(type: Notification['type']): string {
  switch (type) {
    case 'ERROR':
      return 'border-destructive/50 bg-destructive/10 dark:bg-destructive/20';
    case 'WARNING':
      return 'border-yellow-500/50 bg-yellow-500/10 dark:bg-yellow-500/20';
    case 'SUCCESS':
      return 'border-green-500/50 bg-green-500/10 dark:bg-green-500/20';
    case 'INFO':
      return 'border-primary/50 bg-primary/10 dark:bg-primary/20';
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
      return 'text-yellow-600 dark:text-yellow-400';
    case 'SUCCESS':
      return 'text-green-600 dark:text-green-400';
    case 'INFO':
      return 'text-primary';
    case 'SYSTEM':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
}

export function ToastNotification({
  notification,
  onDismiss,
  autoHideDelay = 7000,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Auto-hide only if dismissible
    if (!notification.isDismissible || autoHideDelay <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 300); // Animation duration
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [notification.isDismissible, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  const handleNavigate = () => {
    if (notification.actionUrl) {
      handleDismiss();
      router.push(notification.actionUrl);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative min-w-[320px] max-w-[420px] rounded-lg border shadow-lg transition-all duration-300',
        getNotificationColorClass(notification.type),
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0'
      )}
    >
      <div className="flex gap-3 p-4">
        {/* Icon */}
        <div className="shrink-0 pt-0.5">
          <NotificationIcon
            type={notification.type}
            className={cn(getIconColorClass(notification.type))}
            size={20}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold leading-tight">
              {notification.title}
            </h4>
            {notification.isDismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mt-0.5 -mr-1"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {notification.message && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          )}

          {/* Action Button */}
          {notification.actionUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleNavigate}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              {notification.actionLabel || 'Перейти'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
