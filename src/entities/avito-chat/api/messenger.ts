import { apiClient, ApiError } from '@/shared/api';
import type { ChatsResponse, MessagesResponse } from '../model/types';

/**
 * Получить список чатов Avito для тенанта
 */
export async function getChats(tenantId: string): Promise<ChatsResponse> {
  try {
    return await apiClient.get<ChatsResponse>(
      `/api/avito-messenger/chats/${tenantId}`
    );
  } catch (error) {
    // Если endpoint не найден или тенант не найден, возвращаем пустой список
    // Это может означать, что API еще не реализован или у тенанта нет чатов
    if (error instanceof ApiError && error.status === 404) {
      return [];
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
