import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TelegramAuthResponse } from "@/shared/types/telegram";
import type { AvitoAccount } from "@/entities/avito-account";
import type { Chat, Message } from "@/entities/avito-chat";
import { getAvitoAccounts, getChats, getMessages } from "@/shared/lib/api";

// ========== Auth Store ==========
interface AuthState {
  authData: TelegramAuthResponse | null;
  isAuthenticating: boolean;
  setAuthData: (data: TelegramAuthResponse | null) => void;
  setAuthenticating: (isAuthenticating: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  authData: null,
  isAuthenticating: true, // Начинаем с true, чтобы показать загрузку
  setAuthData: (data) => set({ authData: data, isAuthenticating: false }),
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
  clearAuth: () => set({ authData: null }),
}));

// ========== Theme Store ==========
export type ThemeMode = "light" | "dark" | "auto";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "auto",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "theme_mode",
    }
  )
);

// ========== Avito Accounts Store ==========
interface AvitoAccountsState {
  accountsByTenant: Record<string, AvitoAccount[]>;
  loadingByTenant: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  loadAccounts: (tenantId: string) => Promise<void>;
  setAccounts: (tenantId: string, accounts: AvitoAccount[]) => void;
  addAccount: (tenantId: string, account: AvitoAccount) => void;
  removeAccount: (tenantId: string, accountId: string) => void;
  clearAccounts: (tenantId: string) => void;
  setLoading: (tenantId: string, loading: boolean) => void;
  setError: (tenantId: string, error: string | null) => void;
}

export const useAvitoAccountsStore = create<AvitoAccountsState>()((set, get) => ({
  accountsByTenant: {},
  loadingByTenant: {},
  errorsByTenant: {},
  
  loadAccounts: async (tenantId: string) => {
    const state = get();
    
    // Если уже загружается, не делаем повторный запрос
    if (state.loadingByTenant[tenantId]) {
      return;
    }
    
    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
    }));
    
    try {
      const accounts = await getAvitoAccounts(tenantId);
      set((state) => ({
        accountsByTenant: { ...state.accountsByTenant, [tenantId]: accounts },
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке аккаунтов';
      set((state) => ({
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },
  
  setAccounts: (tenantId: string, accounts: AvitoAccount[]) => {
    set((state) => ({
      accountsByTenant: { ...state.accountsByTenant, [tenantId]: accounts },
    }));
  },
  
  addAccount: (tenantId: string, account: AvitoAccount) => {
    set((state) => {
      const existingAccounts = state.accountsByTenant[tenantId] || [];
      const accountExists = existingAccounts.some((acc) => acc.id === account.id);
      
      if (accountExists) {
        // Обновляем существующий аккаунт
        return {
          accountsByTenant: {
            ...state.accountsByTenant,
            [tenantId]: existingAccounts.map((acc) =>
              acc.id === account.id ? account : acc
            ),
          },
        };
      }
      
      // Добавляем новый аккаунт
      return {
        accountsByTenant: {
          ...state.accountsByTenant,
          [tenantId]: [...existingAccounts, account],
        },
      };
    });
  },
  
  removeAccount: (tenantId: string, accountId: string) => {
    set((state) => {
      const existingAccounts = state.accountsByTenant[tenantId] || [];
      return {
        accountsByTenant: {
          ...state.accountsByTenant,
          [tenantId]: existingAccounts.filter((acc) => acc.id !== accountId),
        },
      };
    });
  },
  
  clearAccounts: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restAccounts } = state.accountsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
      const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;
      
      return {
        accountsByTenant: restAccounts,
        loadingByTenant: restLoading,
        errorsByTenant: restErrors,
      };
    });
  },
  
  setLoading: (tenantId: string, loading: boolean) => {
    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: loading },
    }));
  },
  
  setError: (tenantId: string, error: string | null) => {
    set((state) => ({
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: error },
    }));
  },
}));

// ========== Chats Store ==========
interface ChatsState {
  chatsByTenant: Record<string, Chat[]>;
  messagesByChat: Record<string, Message[]>;
  loadingByTenant: Record<string, boolean>;
  loadingMessagesByChat: Record<string, boolean>;
  errorsByTenant: Record<string, string | null>;
  errorsMessagesByChat: Record<string, string | null>;
  lastUpdateByTenant: Record<string, number>;
  lastUpdateMessagesByChat: Record<string, number>;
  
  // Методы для чатов
  loadChats: (tenantId: string) => Promise<void>;
  refreshChats: (tenantId: string) => Promise<void>;
  updateChat: (tenantId: string, chatId: string, updates: Partial<Chat>) => void;
  setChats: (tenantId: string, chats: Chat[]) => void;
  
  // Методы для сообщений
  loadMessages: (chatId: string) => Promise<void>;
  refreshMessages: (chatId: string) => Promise<void>;
  addMessage: (chatId: string, message: Message) => void;
  updateMessages: (chatId: string, messages: Message[]) => void;
  
  // Вспомогательные методы
  getChat: (tenantId: string, chatId: string) => Chat | undefined;
  getMessages: (chatId: string) => Message[];
  clearChats: (tenantId: string) => void;
  clearMessages: (chatId: string) => void;
}

export const useChatsStore = create<ChatsState>()((set, get) => ({
  chatsByTenant: {},
  messagesByChat: {},
  loadingByTenant: {},
  loadingMessagesByChat: {},
  errorsByTenant: {},
  errorsMessagesByChat: {},
  lastUpdateByTenant: {},
  lastUpdateMessagesByChat: {},
  
  // Загрузка чатов
  loadChats: async (tenantId: string) => {
    const state = get();
    
    // Если уже загружается, не делаем повторный запрос
    if (state.loadingByTenant[tenantId]) {
      return;
    }
    
    set((state) => ({
      loadingByTenant: { ...state.loadingByTenant, [tenantId]: true },
      errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
    }));
    
    try {
      const chats = await getChats(tenantId);
      set((state) => ({
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        lastUpdateByTenant: { ...state.lastUpdateByTenant, [tenantId]: Date.now() },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке чатов';
      set((state) => ({
        loadingByTenant: { ...state.loadingByTenant, [tenantId]: false },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },
  
  // Обновление чатов (без проверки loading)
  refreshChats: async (tenantId: string) => {
    try {
      const chats = await getChats(tenantId);
      set((state) => ({
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: null },
        lastUpdateByTenant: { ...state.lastUpdateByTenant, [tenantId]: Date.now() },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении чатов';
      set((state) => ({
        errorsByTenant: { ...state.errorsByTenant, [tenantId]: errorMessage },
      }));
    }
  },
  
  // Обновление конкретного чата
  updateChat: (tenantId: string, chatId: string, updates: Partial<Chat>) => {
    set((state) => {
      const chats = state.chatsByTenant[tenantId] || [];
      const updatedChats = chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      );
      return {
        chatsByTenant: { ...state.chatsByTenant, [tenantId]: updatedChats },
      };
    });
  },
  
  setChats: (tenantId: string, chats: Chat[]) => {
    set((state) => ({
      chatsByTenant: { ...state.chatsByTenant, [tenantId]: chats },
    }));
  },
  
  // Загрузка сообщений
  loadMessages: async (chatId: string) => {
    const state = get();
    
    // Если уже загружается, не делаем повторный запрос
    if (state.loadingMessagesByChat[chatId]) {
      return;
    }
    
    set((state) => ({
      loadingMessagesByChat: { ...state.loadingMessagesByChat, [chatId]: true },
      errorsMessagesByChat: { ...state.errorsMessagesByChat, [chatId]: null },
    }));
    
    try {
      const messages = await getMessages(chatId);
      set((state) => ({
        messagesByChat: { ...state.messagesByChat, [chatId]: messages },
        loadingMessagesByChat: { ...state.loadingMessagesByChat, [chatId]: false },
        errorsMessagesByChat: { ...state.errorsMessagesByChat, [chatId]: null },
        lastUpdateMessagesByChat: { ...state.lastUpdateMessagesByChat, [chatId]: Date.now() },
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке сообщений';
      set((state) => ({
        loadingMessagesByChat: { ...state.loadingMessagesByChat, [chatId]: false },
        errorsMessagesByChat: { ...state.errorsMessagesByChat, [chatId]: errorMessage },
      }));
    }
  },
  
  // Обновление сообщений (без проверки loading)
  refreshMessages: async (chatId: string) => {
    try {
      const messages = await getMessages(chatId);
      const currentState = get();
      
      set((state) => ({
        messagesByChat: { ...state.messagesByChat, [chatId]: messages },
        errorsMessagesByChat: { ...state.errorsMessagesByChat, [chatId]: null },
        lastUpdateMessagesByChat: { ...state.lastUpdateMessagesByChat, [chatId]: Date.now() },
      }));
      
      // Обновляем информацию о последнем сообщении в чате
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        // Нормализуем дату: если это Unix timestamp в секундах, конвертируем в ISO строку
        let updatedAt = lastMessage.created;
        if (/^\d+$/.test(updatedAt)) {
          const timestamp = parseInt(updatedAt, 10);
          const date = timestamp < 10000000000 
            ? new Date(timestamp * 1000) 
            : new Date(timestamp);
          if (!isNaN(date.getTime())) {
            updatedAt = date.toISOString();
          }
        }
        
        // Находим tenantId для этого чата
        for (const [tenantId, chats] of Object.entries(currentState.chatsByTenant)) {
          const chat = chats.find((c) => c.id === chatId);
          if (chat) {
            // Обновляем lastMessageContent и updatedAt
            get().updateChat(tenantId, chatId, {
              lastMessageContent: {
                text: lastMessage.text,
                image: lastMessage.image,
                call: lastMessage.call,
                voice: lastMessage.voice,
                location: lastMessage.location,
                link: lastMessage.link,
                item: lastMessage.item,
              },
              updatedAt,
            });
            break;
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении сообщений';
      set((state) => ({
        errorsMessagesByChat: { ...state.errorsMessagesByChat, [chatId]: errorMessage },
      }));
    }
  },
  
  // Добавление нового сообщения
  addMessage: (chatId: string, message: Message) => {
    set((state) => {
      const existingMessages = state.messagesByChat[chatId] || [];
      // Проверяем, нет ли уже такого сообщения
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...existingMessages, message],
        },
      };
    });
  },
  
  updateMessages: (chatId: string, messages: Message[]) => {
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatId]: messages },
    }));
  },
  
  // Получение чата
  getChat: (tenantId: string, chatId: string) => {
    const state = get();
    const chats = state.chatsByTenant[tenantId] || [];
    return chats.find((chat) => chat.id === chatId);
  },
  
  // Получение сообщений
  getMessages: (chatId: string) => {
    const state = get();
    return state.messagesByChat[chatId] || [];
  },
  
  // Очистка чатов
  clearChats: (tenantId: string) => {
    set((state) => {
      const { [tenantId]: _, ...restChats } = state.chatsByTenant;
      const { [tenantId]: __, ...restLoading } = state.loadingByTenant;
      const { [tenantId]: ___, ...restErrors } = state.errorsByTenant;
      const { [tenantId]: ____, ...restLastUpdate } = state.lastUpdateByTenant;
      
      return {
        chatsByTenant: restChats,
        loadingByTenant: restLoading,
        errorsByTenant: restErrors,
        lastUpdateByTenant: restLastUpdate,
      };
    });
  },
  
  // Очистка сообщений
  clearMessages: (chatId: string) => {
    set((state) => {
      const { [chatId]: _, ...restMessages } = state.messagesByChat;
      const { [chatId]: __, ...restLoading } = state.loadingMessagesByChat;
      const { [chatId]: ___, ...restErrors } = state.errorsMessagesByChat;
      const { [chatId]: ____, ...restLastUpdate } = state.lastUpdateMessagesByChat;
      
      return {
        messagesByChat: restMessages,
        loadingMessagesByChat: restLoading,
        errorsMessagesByChat: restErrors,
        lastUpdateMessagesByChat: restLastUpdate,
      };
    });
  },
}));
