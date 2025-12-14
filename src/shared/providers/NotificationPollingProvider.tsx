'use client';

import { useNotificationSync } from '@/features/notification-sync';

export function NotificationPollingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationSync();
  return <>{children}</>;
}
