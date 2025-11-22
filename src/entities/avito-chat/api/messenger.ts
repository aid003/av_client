import { apiClient } from '@/shared/api';
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
    if (error instanceof Error && 'status' in error && (error as any).status === 404) {
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
