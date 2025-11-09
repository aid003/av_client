"use client";

import { useState } from "react";
import { sendMessage } from "@/entities/message";
import type {
  SendMessageRequest,
  SendMessageResponse,
  MessageError,
} from "@/entities/message";

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (
    tenantId: string,
    accountId: string,
    request: SendMessageRequest,
    onSuccess?: (response: SendMessageResponse) => void
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sendMessage(tenantId, accountId, request);

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      const error = err as MessageError;
      setError(error.message || "Не удалось отправить сообщение");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleSend, loading, error, clearError: () => setError(null) };
}

