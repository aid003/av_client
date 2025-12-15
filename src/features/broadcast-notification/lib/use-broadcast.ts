import { useState, useCallback } from 'react';
import { createNotification } from '@/entities/notification';
import type { CreateNotificationDto } from '@/entities/notification';

export interface BroadcastResult {
  success: string[];
  failed: Array<{ tenantId: string; error: string }>;
}

export interface BroadcastProgress {
  sent: number;
  total: number;
  failed: number;
}

export function useBroadcast() {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState<BroadcastProgress>({
    sent: 0,
    total: 0,
    failed: 0,
  });
  const [errors, setErrors] = useState<Array<{ tenantId: string; error: string }>>([]);

  const sendBroadcast = useCallback(
    async (
      tenantIds: string[],
      notificationData: CreateNotificationDto,
      initData: string
    ): Promise<BroadcastResult> => {
      setIsSending(true);
      setProgress({ sent: 0, total: tenantIds.length, failed: 0 });
      setErrors([]);

      const results: BroadcastResult = {
        success: [],
        failed: [],
      };

      for (let i = 0; i < tenantIds.length; i++) {
        const tenantId = tenantIds[i];

        try {
          await createNotification(tenantId, notificationData, initData);
          results.success.push(tenantId);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Неизвестная ошибка';
          results.failed.push({
            tenantId,
            error: errorMessage,
          });
        }

        // Update progress
        setProgress({
          sent: i + 1,
          total: tenantIds.length,
          failed: results.failed.length,
        });

        setErrors([...results.failed]);
      }

      setIsSending(false);
      return results;
    },
    []
  );

  const reset = useCallback(() => {
    setProgress({ sent: 0, total: 0, failed: 0 });
    setErrors([]);
  }, []);

  return {
    isSending,
    progress,
    errors,
    sendBroadcast,
    reset,
  };
}
