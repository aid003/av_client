"use client";

import { useEffect, useState, useCallback } from "react";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { getConversations } from "@/entities/conversation";
import type {
  Conversation,
  ConversationFilters,
  ConversationError,
} from "@/entities/conversation";
import type { Filters } from "@/features/conversation-filters";

export function useConversations(filters: Filters) {
  const { authData } = useTelegramAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchConversations = useCallback(
    async (resetOffset = false) => {
      if (!authData?.tenant?.id) {
        setError("Тенант не найден");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentOffset = resetOffset ? 0 : offset;

        const apiFilters: ConversationFilters = {
          accountId: filters.accountId,
          unreadOnly: filters.unreadOnly,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          limit,
          offset: currentOffset,
        };

        const data = await getConversations(authData.tenant.id, apiFilters);

        if (resetOffset) {
          setConversations(data.conversations);
          setOffset(limit);
        } else {
          setConversations((prev) => [...prev, ...data.conversations]);
          setOffset((prev) => prev + limit);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (err) {
        const error = err as ConversationError;
        setError(error.message || "Ошибка при загрузке диалогов");
      } finally {
        setLoading(false);
      }
    },
    [authData?.tenant?.id, filters, offset]
  );

  // Фильтруем по поиску на клиенте
  const filteredConversations = conversations.filter((conv) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      conv.user?.name?.toLowerCase().includes(searchLower) ||
      conv.item?.title?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.contentJson?.text
        ?.toLowerCase()
        .includes(searchLower)
    );
  });

  useEffect(() => {
    fetchConversations(true);

    // Автообновление каждые 10 секунд
    const intervalId = setInterval(() => {
      fetchConversations(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [
    authData?.tenant?.id,
    filters.accountId,
    filters.unreadOnly,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchConversations(false);
    }
  };

  return {
    conversations: filteredConversations,
    total,
    hasMore,
    loading,
    error,
    loadMore,
    refetch: () => fetchConversations(true),
  };
}

