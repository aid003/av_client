'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/components/ui/popover';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Button } from '@/shared/ui/components/ui/button';
import { NotificationItem } from './NotificationItem';
import { useNotificationStore } from '@/entities/notification';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { Bell, Loader2 } from 'lucide-react';
import { NotificationBadge } from '@/entities/notification';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
  children?: React.ReactNode;
}

export function NotificationDropdown({ children }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const { tenantId } = useTelegramAuth();
  const router = useRouter();

  const {
    getNotificationsByTenant,
    getUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    loadingByTenant,
  } = useNotificationStore();

  const notifications = tenantId ? getNotificationsByTenant(tenantId) : [];
  const unreadCount = tenantId ? getUnreadCount(tenantId) : 0;
  const isLoading = tenantId ? loadingByTenant[tenantId] ?? false : false;

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open && tenantId) {
      fetchNotifications(tenantId, {
        activeOnly: true,
        perPage: 50,
      });
    }
  }, [open, tenantId, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    if (!tenantId) return;
    try {
      await markAsRead(tenantId, id);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleDismiss = async (id: string) => {
    if (!tenantId) return;
    try {
      await dismissNotification(tenantId, id);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to dismiss notification:', error);
      }
    }
  };

  const handleNavigate = (actionUrl: string | null) => {
    if (actionUrl) {
      setOpen(false);
      router.push(actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!tenantId) return;
    try {
      await markAllAsRead(tenantId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to mark all as read:', error);
      }
    }
  };

  const activeNotifications = notifications.filter((n) => {
    if (n.isDismissed) return false;
    if (n.expiresAt) {
      return new Date(n.expiresAt) > new Date();
    }
    return true;
  });

  const triggerContent = children || (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <NotificationBadge
          count={unreadCount}
          className="absolute -top-1 -right-1"
        />
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          {triggerContent}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        side="top"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Уведомления</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
              >
                Прочитать все
              </Button>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[400px]">
            {isLoading && activeNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Нет активных уведомлений
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {activeNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onDismiss={
                      notification.isDismissible
                        ? () => handleDismiss(notification.id)
                        : undefined
                    }
                    onNavigate={
                      notification.actionUrl
                        ? () => handleNavigate(notification.actionUrl)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
