import { apiClient, ApiError } from '@/shared/api';
import { config } from '@/shared/lib/config';

/**
 * Информация о webhook
 */
export interface WebhookInfo {
  id: string;
  avitoAccountId: string;
  url: string;
  version: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Получить информацию о webhook для аккаунта
 */
export async function getWebhookStatus(
  accountId: string
): Promise<WebhookInfo | null> {
  try {
    return await apiClient.get<WebhookInfo>(
      `/api/avito-messenger/webhook/${accountId}`
    );
  } catch (error) {
    // Если webhook не найден (404), возвращаем null
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Зарегистрировать webhook для получения сообщений
 */
export async function registerWebhook(accountId: string): Promise<void> {
  const webhookUrl = `${config.apiBaseUrl}/api/avito-webhook/${accountId}`;

  return apiClient.post<void, { url: string }>(
    `/api/avito-messenger/register/${accountId}`,
    { url: webhookUrl }
  );
}

/**
 * Отписаться от webhook уведомлений
 */
export async function unsubscribeWebhook(accountId: string): Promise<void> {
  return apiClient.delete<void>(`/api/avito-messenger/webhook/${accountId}`);
}
