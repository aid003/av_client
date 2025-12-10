'use client';

import { NotificationDropdown } from './NotificationDropdown';
import { Bell } from 'lucide-react';
import { NotificationBadge } from '@/entities/notification';
import { useNotificationStore } from '@/entities/notification';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { cn } from '@/shared/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { tenantId } = useTelegramAuth();
  const { getUnreadCount } = useNotificationStore();
  const unreadCount = tenantId ? getUnreadCount(tenantId) : 0;

  return (
    <NotificationDropdown>
      <div className={cn('relative', className)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <NotificationBadge
            count={unreadCount}
            className="absolute -top-1 -right-1"
          />
        )}
      </div>
    </NotificationDropdown>
  );
}
