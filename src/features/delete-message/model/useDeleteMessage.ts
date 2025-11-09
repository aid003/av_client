"use client";

import { useState } from "react";
import { deleteMessage } from "@/entities/message";
import type { MessageError } from "@/entities/message";

export function useDeleteMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (
    tenantId: string,
    accountId: string,
    chatId: string,
    messageId: string,
    onSuccess?: () => void
  ) => {
    try {
      setLoading(true);
      setError(null);

      await deleteMessage(tenantId, accountId, chatId, messageId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as MessageError;
      setError(
        error.message || "Не удалось удалить сообщение. Возможно, прошло более часа."
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleDelete, loading, error };
}

