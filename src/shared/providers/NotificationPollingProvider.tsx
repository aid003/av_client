'use client';

import { useNotificationPolling } from '@/features/notification-polling';

export function NotificationPollingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationPolling();
  return <>{children}</>;
}
