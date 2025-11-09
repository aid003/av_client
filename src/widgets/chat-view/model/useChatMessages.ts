"use client";

import { useEffect, useState, useCallback } from "react";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { getMessages } from "@/entities/message";
import { getConversation } from "@/entities/conversation";
import type { Message, MessageError } from "@/entities/message";
import type {
  ConversationDetails,
  ConversationError,
} from "@/entities/conversation";

export function useChatMessages(conversationId: string | null) {
  const { authData } = useTelegramAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] =
    useState<ConversationDetails | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchConversation = useCallback(async () => {
    if (!authData?.tenant?.id || !conversationId) return;

    try {
      const data = await getConversation(authData.tenant.id, conversationId);
      setConversation(data);
    } catch (err) {
      const error = err as ConversationError;
      console.error("Ошибка загрузки диалога:", error.message);
    }
  }, [authData?.tenant?.id, conversationId]);

  const fetchMessages = useCallback(
    async (resetOffset = false) => {
      if (!authData?.tenant?.id || !conversationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentOffset = resetOffset ? 0 : offset;

        const data = await getMessages(
          authData.tenant.id,
          conversationId,
          limit,
          currentOffset
        );

        if (resetOffset) {
          setMessages(data.messages);
          setOffset(limit);
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
          setOffset((prev) => prev + limit);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (err) {
        const error = err as MessageError;
        setError(error.message || "Ошибка при загрузке сообщений");
      } finally {
        setLoading(false);
      }
    },
    [authData?.tenant?.id, conversationId, offset]
  );

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setOffset(0);
      setError(null);
      fetchConversation();
      fetchMessages(true);

      // Автообновление сообщений каждые 5 секунд
      const intervalId = setInterval(() => {
        fetchMessages(true);
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [conversationId]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(false);
    }
  };

  return {
    messages,
    conversation,
    total,
    hasMore,
    loading,
    error,
    loadMore,
    refetch: () => fetchMessages(true),
    refetchConversation: fetchConversation,
  };
}

