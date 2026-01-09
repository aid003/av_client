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
  // В светлой теме - темный фон, в темной теме - светлый фон (для контраста)
  const baseBg = 'bg-slate-900 dark:bg-white backdrop-blur-sm';
  
  switch (type) {
    case 'ERROR':
      return `border-red-500 dark:border-red-600 ${baseBg}`;
    case 'WARNING':
      return `border-yellow-500 dark:border-yellow-600 ${baseBg}`;
    case 'SUCCESS':
      return `border-green-500 dark:border-green-600 ${baseBg}`;
    case 'INFO':
      return `border-blue-500 dark:border-blue-600 ${baseBg}`;
    case 'SYSTEM':
      return `border-slate-600 dark:border-slate-400 ${baseBg}`;
    default:
      return `border-slate-600 dark:border-slate-400 ${baseBg}`;
  }
}

function getIconColorClass(type: Notification['type']): string {
  // В светлой теме (темный фон уведомления) - светлые иконки, в темной теме (светлый фон) - темные иконки
  switch (type) {
    case 'ERROR':
      return 'text-red-400 dark:text-red-600';
    case 'WARNING':
      return 'text-yellow-400 dark:text-yellow-600';
    case 'SUCCESS':
      return 'text-green-400 dark:text-green-600';
    case 'INFO':
      return 'text-blue-400 dark:text-blue-600';
    case 'SYSTEM':
      return 'text-slate-400 dark:text-slate-600';
    default:
      return 'text-slate-400 dark:text-slate-600';
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
          ? 'opacity-0 translate-y-full scale-95'
          : 'opacity-100 translate-y-0 scale-100'
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
            <h4 className="text-sm font-semibold leading-tight text-white dark:text-slate-900">
              {notification.title}
            </h4>
            {notification.isDismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mt-0.5 -mr-1 text-white dark:text-slate-900 hover:bg-white/20 dark:hover:bg-slate-900/10"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {notification.message && (
            <p className="text-sm text-slate-300 dark:text-slate-700 line-clamp-2">
              {notification.message}
            </p>
          )}

          {/* Action Button */}
          {notification.actionUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-slate-600 dark:border-slate-400 text-white dark:text-slate-900 hover:bg-white/20 dark:hover:bg-slate-900/10"
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
