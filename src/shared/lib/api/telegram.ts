import type { TelegramAuthRequest, TelegramAuthResponse, TelegramAuthError } from '@/shared/types/telegram';
import { config } from '@/shared/lib/config';

export class UserBlockedError extends Error {
  public readonly code: 'USER_BLOCKED' = 'USER_BLOCKED';
  constructor(public readonly reason: string) {
    super(reason);
    this.name = 'UserBlockedError';
  }
}

export async function authenticateTelegram(
  initData: string
): Promise<TelegramAuthResponse> {
  const url = `${config.apiBaseUrl}/auth/telegram`;
  const body = { initData } as TelegramAuthRequest;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Дополнительно передаём initData в Authorization на случай,
        // если бэкенд ожидает его в заголовке.
        'Authorization': `tma ${initData}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // Оборачиваем сетевую ошибку с подсказками
    const hint =
      'Проверьте: 1) HTTPS сертификат, 2) CORS: Origin https://t.me, 3) Доступность домена из Telegram WebView, 4) Правильность NEXT_PUBLIC_API_BASE_URL.';
    const message = e instanceof Error ? `${e.message}. ${hint}` : `Network error. ${hint}`;
    throw new Error(message);
  }

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[auth/telegram] status:', response.status);
  }

  if (!response.ok) {
    // Специальная обработка 403 USER_BLOCKED
    if (response.status === 403) {
      try {
        const errorJson = (await response.json()) as TelegramAuthError;
        if (errorJson?.code === 'USER_BLOCKED') {
          throw new UserBlockedError(errorJson.message);
        }
      } catch {
        // если парсинг не удался — упадём в общий обработчик ниже
      }
    }
    let serverMessage = 'Ошибка авторизации';
    let serverCode: string | undefined;
    try {
      const errorJson = await response.json();
      serverMessage = errorJson?.message ?? serverMessage;
      serverCode = errorJson?.code;
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[auth/telegram] error JSON:', errorJson);
      }
    } catch {
      try {
        const text = await response.text();
        serverMessage = text || serverMessage;
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[auth/telegram] error TEXT:', text);
        }
      } catch {
        // ignore
      }
    }
    const composed = `[${response.status}] ${serverMessage}${serverCode ? ` (${serverCode})` : ''}`;
    throw new Error(composed);
  }

  const data = await response.json();
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[auth/telegram] data:', data);
  }
  return data;
}

