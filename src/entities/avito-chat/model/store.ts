import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Chat, Message } from './types';
import { getChats, getMessages } from '../api';
import { ERROR_MESSAGES } from '@/shared/lib/error-messages';

interface ChatsState {
  // Чаты по tenantId
  chatsByTenant: Record<string, Chat[]>;
  loadingChatsByTenant: Record<string, boolean>;
  errorsChatsByTenant: Record<string, string | null>;

  // Сообщения по chatId
  messagesByChatId: Record<string, Message[]>;
  loadingMessagesByChatId: Record<string, boolean>;
  errorsMessagesByChatId: Record<string, string | null>;

  // Actions для чатов
  loadChats: (tenantId: string) => Promise<void>;
  refreshChats: (tenantId: string) => Promise<void>;
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
  errorsChatsByTenant: {},
  messagesByChatId: {},
  loadingMessagesByChatId: {},
  errorsMessagesByChatId: {},

  // === Chats Actions ===

  loadChats: async (tenantId: string) => {
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
      const chats = await getChats(tenantId);
      set((state) => ({
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
        loadingChatsByTenant: {
          ...state.loadingChatsByTenant,
          [tenantId]: false,
        },
        errorsChatsByTenant: { ...state.errorsChatsByTenant, [tenantId]: null },
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

  refreshChats: async (tenantId: string) => {
    try {
      const chats = await getChats(tenantId);
      set((state) => ({
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
        errorsChatsByTenant: { ...state.errorsChatsByTenant, [tenantId]: null },
      }));
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
    }));
  },

  clearChats: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restChats } = state.chatsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingChatsByTenant;
      const { [tenantId]: ___, ...restErrors } = state.errorsChatsByTenant;

      return {
        chatsByTenant: restChats,
        loadingChatsByTenant: restLoading,
        errorsChatsByTenant: restErrors,
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
 * Получить ошибку чатов для конкретного тенанта
 */
export const useChatsError = (tenantId: string) =>
  useChatsStore((state) => state.errorsChatsByTenant[tenantId] ?? null);

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
