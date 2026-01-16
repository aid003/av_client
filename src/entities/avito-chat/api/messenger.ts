import { apiClient, ApiError } from '@/shared/api';
import type { ChatsResponse, MessagesResponse } from '../model/types';

/**
 * Получить список чатов Avito для тенанта
 */
export async function getChats(
  tenantId: string,
  options?: { limit?: number; cursor?: string | null }
): Promise<ChatsResponse> {
  try {
    const params: Record<string, string | number | boolean> = {};
    if (typeof options?.limit === 'number') {
      params.limit = options.limit;
    }
    if (options?.cursor) {
      params.cursor = options.cursor;
    }

    return await apiClient.get<ChatsResponse>(
      `/api/avito-messenger/chats/${tenantId}`,
      Object.keys(params).length > 0 ? params : undefined
    );
  } catch (error) {
    // Если endpoint не найден или тенант не найден, возвращаем пустой список
    // Это может означать, что API еще не реализован или у тенанта нет чатов
    if (error instanceof ApiError && error.status === 404) {
      return {
        items: [],
        nextCursor: null,
        hasMore: false,
        total: 0,
      };
    }
    throw error;
  }
}

/**
 * Получить сообщения чата
 */
export async function getMessages(chatId: string): Promise<MessagesResponse> {
  return apiClient.get<MessagesResponse>(
    `/api/avito-messenger/messages/${chatId}`
  );
}

/**
 * Включить ИИ-скрипт в чате после ручного отключения
 */
export async function enableChatScript(
  chatId: string,
  tenantId: string
): Promise<void> {
  return apiClient.post<void>(
    `/api/avito-messenger/chats/${chatId}/script/enable`,
    undefined,
    { params: { tenantId } }
  );
}
