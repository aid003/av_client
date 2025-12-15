import { useTelegram } from '@/shared/providers/TelegramProvider';

/**
 * Хук для получения Telegram initData для использования в API запросах
 * @returns initData строка или null
 */
export function useTelegramInitData(): string | null {
  const { initData } = useTelegram();
  return initData;
}

