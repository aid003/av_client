import { create } from 'zustand';
import type { Chat, Message } from './types';
import { getChats, getMessages } from '../api';

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
        err instanceof Error ? err.message : 'Ошибка при загрузке чатов';
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
        err instanceof Error ? err.message : 'Ошибка при обновлении чатов';
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
        err instanceof Error ? err.message : 'Ошибка при загрузке сообщений';
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
        err instanceof Error ? err.message : 'Ошибка при обновлении сообщений';
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
