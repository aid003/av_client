import { config } from '@/shared/lib/config';
import type { ChatsResponse, MessagesResponse } from '@/entities/avito-chat';

/**
 * Получить список чатов Avito для тенанта
 */
export async function getChats(tenantId: string): Promise<ChatsResponse> {
  const url = `${config.apiBaseUrl}/api/avito-messenger/chats/${tenantId}`;

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Если endpoint не найден или тенант не найден, возвращаем пустой список
      // Это может означать, что API еще не реализован или у тенанта нет чатов
      return [];
    }
    throw new Error(`Ошибка при загрузке чатов: ${response.status}`);
  }

  return await response.json();
}

/**
 * Получить сообщения чата
 */
export async function getMessages(chatId: string): Promise<MessagesResponse> {
  const url = `${config.apiBaseUrl}/api/avito-messenger/messages/${chatId}`;

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Чат не найден');
    }
    throw new Error(`Ошибка при загрузке сообщений: ${response.status}`);
  }

  return await response.json();
}

