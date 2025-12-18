'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/entities/notification';

/**
 * Hook для трекинга активности пользователя в приложении
 *
 * Обновляет lastActiveAt при:
 * - Монтировании компонента (приложение открылось)
 * - Возврате на вкладку (visibilitychange → visible)
 * - Фокусе на окне (focus)
 */
export function useAppActivityTracker(tenantId: string | undefined) {
  const { updateLastActiveAt } = useNotificationStore();

  useEffect(() => {
    if (!tenantId) {
      return;
    }

    // Обновить при монтировании (приложение открылось)
    updateLastActiveAt(tenantId);

    if (process.env.NODE_ENV === 'development') {
      console.log('[AppActivityTracker] Initial lastActiveAt update for tenant:', tenantId);
    }

    // Обработчик visibility change (переключение между вкладками)
    const handleVisibilityChange = () => {
      if (!document.hidden && tenantId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AppActivityTracker] Page became visible, updating lastActiveAt');
        }
        updateLastActiveAt(tenantId);
      }
    };

    // Обработчик focus (окно получило фокус)
    const handleFocus = () => {
      if (tenantId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AppActivityTracker] Window focused, updating lastActiveAt');
        }
        updateLastActiveAt(tenantId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [tenantId, updateLastActiveAt]);
}
