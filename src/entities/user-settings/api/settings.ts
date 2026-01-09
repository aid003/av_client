import { apiClient } from '@/shared/api/client';
import type { TelegramSettings, UpdateTelegramSettingsRequest } from '../model/types';

/**
 * Получить настройки Telegram пользователя
 */
export async function getTelegramSettings(
  tenantId: string
): Promise<TelegramSettings> {
  return apiClient.get<TelegramSettings>('/api/auth/telegram/settings', { tenantId });
}

/**
 * Обновить настройки Telegram пользователя
 */
export async function updateTelegramSettings(
  tenantId: string,
  data: UpdateTelegramSettingsRequest
): Promise<void> {
  await apiClient.patch<void>('/api/auth/telegram/settings', data, {
    params: { tenantId },
  });
}
