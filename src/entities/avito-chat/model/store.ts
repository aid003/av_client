import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Chat, Message } from './types';
import { getChats, getMessages } from '../api';
import { ERROR_MESSAGES } from '@/shared/lib/error-messages';

const DEFAULT_CHATS_LIMIT = 50;

interface ChatsState {
  // Чаты по tenantId
  chatsByTenant: Record<string, Chat[]>;
  loadingChatsByTenant: Record<string, boolean>;
  loadingMoreChatsByTenant: Record<string, boolean>;
  errorsChatsByTenant: Record<string, string | null>;
  nextCursorByTenant: Record<string, string | null>;
  hasMoreChatsByTenant: Record<string, boolean>;
  totalChatsByTenant: Record<string, number | null>;

  // Сообщения по chatId
  messagesByChatId: Record<string, Message[]>;
  loadingMessagesByChatId: Record<string, boolean>;
  errorsMessagesByChatId: Record<string, string | null>;

  // Actions для чатов
  loadChats: (tenantId: string, limit?: number) => Promise<void>;
  loadMoreChats: (tenantId: string, limit?: number) => Promise<void>;
  refreshChats: (tenantId: string, limit?: number) => Promise<void>;
  setChats: (tenantId: string, chats: Chat[]) => void;
  clearChats: (tenantId: string) => void;

  // Actions для сообщений
  loadMessages: (chatId: string) => Promise<void>;
  refreshMessages: (chatId: string) => Promise<void>;
  setMessages: (chatId: string, messages: Message[]) => void;
  addMessage: (chatId: string, message: Message) => void;
  clearMessages: (chatId: string) => void;
}

export const useChatsStore = create<ChatsState>()((set, get) => ({
  // Initial state
  chatsByTenant: {},
  loadingChatsByTenant: {},
  loadingMoreChatsByTenant: {},
  errorsChatsByTenant: {},
  nextCursorByTenant: {},
  hasMoreChatsByTenant: {},
  totalChatsByTenant: {},
  messagesByChatId: {},
  loadingMessagesByChatId: {},
  errorsMessagesByChatId: {},

  // === Chats Actions ===

  loadChats: async (tenantId: string, limit = DEFAULT_CHATS_LIMIT) => {
    const state = get();

    // Если уже загружается, не делаем повторный запрос
    if (state.loadingChatsByTenant[tenantId]) {
      return;
    }

    set((state) => ({
      loadingChatsByTenant: { ...state.loadingChatsByTenant, [tenantId]: true },
      errorsChatsByTenant: { ...state.errorsChatsByTenant, [tenantId]: null },
    }));

    try {
      const response = await getChats(tenantId, { limit });
      set((state) => ({
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: response.items },
        loadingChatsByTenant: {
          ...state.loadingChatsByTenant,
          [tenantId]: false,
        },
        loadingMoreChatsByTenant: {
          ...state.loadingMoreChatsByTenant,
          [tenantId]: false,
        },
        errorsChatsByTenant: { ...state.errorsChatsByTenant, [tenantId]: null },
        nextCursorByTenant: {
          ...state.nextCursorByTenant,
          [tenantId]: response.nextCursor,
        },
        hasMoreChatsByTenant: {
          ...state.hasMoreChatsByTenant,
          [tenantId]: response.hasMore,
        },
        totalChatsByTenant: {
          ...state.totalChatsByTenant,
          [tenantId]: response.total,
        },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_CHATS;
      set((state) => ({
        loadingChatsByTenant: {
          ...state.loadingChatsByTenant,
          [tenantId]: false,
        },
        errorsChatsByTenant: {
          ...state.errorsChatsByTenant,
          [tenantId]: errorMessage,
        },
      }));
    }
  },

  loadMoreChats: async (tenantId: string, limit = DEFAULT_CHATS_LIMIT) => {
    const state = get();

    if (
      state.loadingChatsByTenant[tenantId] ||
      state.loadingMoreChatsByTenant[tenantId] ||
      !state.hasMoreChatsByTenant[tenantId]
    ) {
      return;
    }

    const cursor = state.nextCursorByTenant[tenantId];
    if (!cursor) {
      return;
    }

    set((state) => ({
      loadingMoreChatsByTenant: {
        ...state.loadingMoreChatsByTenant,
        [tenantId]: true,
      },
      errorsChatsByTenant: { ...state.errorsChatsByTenant, [tenantId]: null },
    }));

    try {
      const response = await getChats(tenantId, { limit, cursor });
      set((state) => {
        const existing = state.chatsByTenant[tenantId] ?? [];
        const existingIds = new Set(existing.map((chat) => chat.id));
        const appended = response.items.filter(
          (chat) => !existingIds.has(chat.id)
        );

        return {
          chatsByTenant: {
            ...state.chatsByTenant,
            [tenantId]: [...existing, ...appended],
          },
          loadingMoreChatsByTenant: {
            ...state.loadingMoreChatsByTenant,
            [tenantId]: false,
          },
          errorsChatsByTenant: {
            ...state.errorsChatsByTenant,
            [tenantId]: null,
          },
          nextCursorByTenant: {
            ...state.nextCursorByTenant,
            [tenantId]: response.nextCursor,
          },
          hasMoreChatsByTenant: {
            ...state.hasMoreChatsByTenant,
            [tenantId]: response.hasMore,
          },
          totalChatsByTenant: {
            ...state.totalChatsByTenant,
            [tenantId]: response.total,
          },
        };
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_CHATS;
      set((state) => ({
        loadingMoreChatsByTenant: {
          ...state.loadingMoreChatsByTenant,
          [tenantId]: false,
        },
        errorsChatsByTenant: {
          ...state.errorsChatsByTenant,
          [tenantId]: errorMessage,
        },
      }));
    }
  },

  refreshChats: async (tenantId: string, limit = DEFAULT_CHATS_LIMIT) => {
    const state = get();

    if (
      state.loadingChatsByTenant[tenantId] ||
      state.loadingMoreChatsByTenant[tenantId]
    ) {
      return;
    }

    try {
      const response = await getChats(tenantId, { limit });
      set((state) => {
        const existing = state.chatsByTenant[tenantId] ?? [];
        const hasLoadedMore = existing.length > limit;
        const newItems = response.items;

        if (!hasLoadedMore) {
          return {
            chatsByTenant: {
              ...state.chatsByTenant,
              [tenantId]: newItems,
            },
            errorsChatsByTenant: {
              ...state.errorsChatsByTenant,
              [tenantId]: null,
            },
            nextCursorByTenant: {
              ...state.nextCursorByTenant,
              [tenantId]: response.nextCursor,
            },
            hasMoreChatsByTenant: {
              ...state.hasMoreChatsByTenant,
              [tenantId]: response.hasMore,
            },
            totalChatsByTenant: {
              ...state.totalChatsByTenant,
              [tenantId]: response.total,
            },
          };
        }

        const newIds = new Set(newItems.map((chat) => chat.id));
        const merged = [
          ...newItems,
          ...existing.filter((chat) => !newIds.has(chat.id)),
        ];

        return {
          chatsByTenant: {
            ...state.chatsByTenant,
            [tenantId]: merged,
          },
          errorsChatsByTenant: {
            ...state.errorsChatsByTenant,
            [tenantId]: null,
          },
          totalChatsByTenant: {
            ...state.totalChatsByTenant,
            [tenantId]: response.total,
          },
        };
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_CHATS;
      set((state) => ({
        errorsChatsByTenant: {
          ...state.errorsChatsByTenant,
          [tenantId]: errorMessage,
        },
      }));
    }
  },

  setChats: (tenantId: string, chats: Chat[]) => {
    set((state) => ({
      chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
      totalChatsByTenant: {
        ...state.totalChatsByTenant,
        [tenantId]: chats.length,
      },
    }));
  },

  clearChats: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restChats } = state.chatsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingChatsByTenant;
      const { [tenantId]: ___, ...restLoadingMore } =
        state.loadingMoreChatsByTenant;
      const { [tenantId]: ____, ...restErrors } = state.errorsChatsByTenant;
      const { [tenantId]: _____, ...restCursors } =
        state.nextCursorByTenant;
      const { [tenantId]: ______, ...restHasMore } =
        state.hasMoreChatsByTenant;
      const { [tenantId]: _______, ...restTotals } =
        state.totalChatsByTenant;

      return {
        chatsByTenant: restChats,
        loadingChatsByTenant: restLoading,
        loadingMoreChatsByTenant: restLoadingMore,
        errorsChatsByTenant: restErrors,
        nextCursorByTenant: restCursors,
        hasMoreChatsByTenant: restHasMore,
        totalChatsByTenant: restTotals,
      };
    });
  },

  // === Messages Actions ===

  loadMessages: async (chatId: string) => {
    const state = get();

    // Если уже загружается, не делаем повторный запрос
    if (state.loadingMessagesByChatId[chatId]) {
      return;
    }

    set((state) => ({
      loadingMessagesByChatId: {
        ...state.loadingMessagesByChatId,
        [chatId]: true,
      },
      errorsMessagesByChatId: {
        ...state.errorsMessagesByChatId,
        [chatId]: null,
      },
    }));

    try {
      const messages = await getMessages(chatId);
      set((state) => ({
        messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
        loadingMessagesByChatId: {
          ...state.loadingMessagesByChatId,
          [chatId]: false,
        },
        errorsMessagesByChatId: {
          ...state.errorsMessagesByChatId,
          [chatId]: null,
        },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_MESSAGES;
      set((state) => ({
        loadingMessagesByChatId: {
          ...state.loadingMessagesByChatId,
          [chatId]: false,
        },
        errorsMessagesByChatId: {
          ...state.errorsMessagesByChatId,
          [chatId]: errorMessage,
        },
      }));
    }
  },

  refreshMessages: async (chatId: string) => {
    try {
      const messages = await getMessages(chatId);
      set((state) => ({
        messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
        errorsMessagesByChatId: {
          ...state.errorsMessagesByChatId,
          [chatId]: null,
        },
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.LOAD_MESSAGES;
      set((state) => ({
        errorsMessagesByChatId: {
          ...state.errorsMessagesByChatId,
          [chatId]: errorMessage,
        },
      }));
    }
  },

  setMessages: (chatId: string, messages: Message[]) => {
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: messages },
    }));
  },

  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      const existingMessages = state.messagesByChatId[chatId] || [];
      const messageExists = existingMessages.some((msg) => msg.id === message.id);

      if (messageExists) {
        // Обновляем существующее сообщение
        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: existingMessages.map((msg) =>
              msg.id === message.id ? message : msg
            ),
          },
        };
      }

      // Добавляем новое сообщение
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...existingMessages, message],
        },
      };
    });
  },

  clearMessages: (chatId: string) => {
    set((state) => {
      const { [chatId]: _, ...restMessages } = state.messagesByChatId;
      const { [chatId]: __, ...restLoading } = state.loadingMessagesByChatId;
      const { [chatId]: ___, ...restErrors } = state.errorsMessagesByChatId;

      return {
        messagesByChatId: restMessages,
        loadingMessagesByChatId: restLoading,
        errorsMessagesByChatId: restErrors,
      };
    });
  },
}));

/**
 * Custom селекторы для оптимизации производительности
 * Используйте эти хуки вместо прямого обращения к store
 */

// Пустые массивы для использования как fallback (чтобы не создавать новые на каждый рендер)
const EMPTY_CHATS: Chat[] = [];
const EMPTY_MESSAGES: Message[] = [];

/**
 * Получить чаты для конкретного тенанта
 */
export const useChatsForTenant = (tenantId: string) =>
  useChatsStore((state) => state.chatsByTenant[tenantId] ?? EMPTY_CHATS);

/**
 * Получить статус загрузки чатов для конкретного тенанта
 */
export const useChatsLoading = (tenantId: string) =>
  useChatsStore((state) => state.loadingChatsByTenant[tenantId] ?? true);

/**
 * Получить статус догрузки чатов для конкретного тенанта
 */
export const useChatsLoadingMore = (tenantId: string) =>
  useChatsStore((state) => state.loadingMoreChatsByTenant[tenantId] ?? false);

/**
 * Получить ошибку чатов для конкретного тенанта
 */
export const useChatsError = (tenantId: string) =>
  useChatsStore((state) => state.errorsChatsByTenant[tenantId] ?? null);

/**
 * Есть ли еще страницы чатов
 */
export const useChatsHasMore = (tenantId: string) =>
  useChatsStore((state) => state.hasMoreChatsByTenant[tenantId] ?? false);

/**
 * Общее количество чатов
 */
export const useChatsTotal = (tenantId: string) =>
  useChatsStore((state) => state.totalChatsByTenant[tenantId] ?? null);

/**
 * Получить сообщения для конкретного чата
 */
export const useMessagesForChat = (chatId: string) =>
  useChatsStore((state) => state.messagesByChatId[chatId] ?? EMPTY_MESSAGES);

/**
 * Получить статус загрузки сообщений для конкретного чата
 */
export const useMessagesLoading = (chatId: string) =>
  useChatsStore((state) => state.loadingMessagesByChatId[chatId] ?? true);

/**
 * Получить ошибку сообщений для конкретного чата
 */
export const useMessagesError = (chatId: string) =>
  useChatsStore((state) => state.errorsMessagesByChatId[chatId] ?? null);

/**
 * Получить actions для чатов (не вызывают ре-рендер)
 */
export const useChatsActions = () =>
  useChatsStore(
    useShallow((state) => ({
      loadChats: state.loadChats,
      loadMoreChats: state.loadMoreChats,
      refreshChats: state.refreshChats,
      setChats: state.setChats,
      clearChats: state.clearChats,
    }))
  );

/**
 * Получить actions для сообщений (не вызывают ре-рендер)
 */
export const useMessagesActions = () =>
  useChatsStore(
    useShallow((state) => ({
      loadMessages: state.loadMessages,
      refreshMessages: state.refreshMessages,
      setMessages: state.setMessages,
      addMessage: state.addMessage,
      clearMessages: state.clearMessages,
    }))
  );
