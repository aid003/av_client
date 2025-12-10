import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/entities/notification';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useNotificationPolling() {
  const { tenantId } = useTelegramAuth();
  const { fetchNotifications } = useNotificationStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    // Initial fetch
    fetchNotifications(tenantId, {
      activeOnly: true,
      perPage: 50,
    });

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchNotifications(tenantId, {
        activeOnly: true,
        perPage: 50,
      });
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tenantId, fetchNotifications]);

  return null;
}
