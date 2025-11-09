"use client";

import { useState } from "react";
import { markMessagesAsRead } from "@/entities/message";
import type { MessageError } from "@/entities/message";

export function useMarkAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkAsRead = async (
    tenantId: string,
    conversationId: string,
    messageIds?: string[],
    onSuccess?: () => void
  ) => {
    try {
      setLoading(true);
      setError(null);

      await markMessagesAsRead(tenantId, conversationId, { messageIds });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as MessageError;
      setError(error.message || "Не удалось пометить сообщения как прочитанные");
    } finally {
      setLoading(false);
    }
  };

  return { handleMarkAsRead, loading, error };
}

