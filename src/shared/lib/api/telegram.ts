import type {
  TelegramAuthRequest,
  TelegramAuthResponse,
  TelegramAuthError,
} from "@/shared/types/telegram";
import { config } from "@/shared/lib/config";

export class UserBlockedError extends Error {
  public readonly code: "USER_BLOCKED" = "USER_BLOCKED";
  constructor(public readonly reason: string) {
    super(reason);
    this.name = "UserBlockedError";
  }
}

export async function authenticateTelegram(
  initData: string
): Promise<TelegramAuthResponse> {
  // Проверка на пустой URL
  if (!config.apiBaseUrl || config.apiBaseUrl.trim() === '') {
    const errorMsg = 'NEXT_PUBLIC_API_BASE_URL не задана или пустая. Проверьте переменные окружения и перезапустите dev сервер.';
    console.error("[auth/telegram] КРИТИЧЕСКАЯ ОШИБКА:", errorMsg);
    throw new Error(errorMsg);
  }

  // Используем Next.js API route как proxy для обхода CORS
  // Это работает, так как запрос идет на тот же домен (Next.js сервер)
  const url = typeof window !== 'undefined' 
    ? '/api/auth/telegram'  // Используем Next.js API route на клиенте
    : `${config.apiBaseUrl}/api/auth/telegram`;  // Прямой запрос на сервере
  
  const body = { initData } as TelegramAuthRequest;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const errorDetails: Record<string, unknown> = {
      error: e,
      errorType: e?.constructor?.name,
      errorMessage: e instanceof Error ? e.message : String(e),
      errorStack: e instanceof Error ? e.stack : undefined,
      url,
      attemptedUrl: url,
      configApiBaseUrl: config.apiBaseUrl,
      origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      isCorsError: e instanceof TypeError && e.message === 'Failed to fetch',
    };

    // Дополнительная диагностика для CORS
    let fromOrigin = 'unknown';
    if (errorDetails.isCorsError) {
      fromOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
      errorDetails.corsDiagnostics = {
        fromOrigin,
        toUrl: url,
        isCrossOrigin: typeof window !== 'undefined' 
          ? new URL(url).origin !== window.location.origin 
          : true,
        note: 'Это CORS ошибка. Backend должен разрешать запросы с вашего домена или используйте Next.js API route как proxy.',
      };
    }

    console.error("[auth/telegram] Ошибка сети при запросе:", errorDetails);
    
    if (errorDetails.isCorsError) {
      throw new Error(
        `CORS ошибка: Backend ${url} не разрешает запросы с ${fromOrigin}. ` +
        `Проверьте настройки CORS на backend или используйте Next.js API route как proxy.`
      );
    }
    
    throw new Error("Сервер временно недоступен. Попробуйте позже.");
  }

  if (!response.ok) {
    // Специальная обработка блокировки пользователя (403 Forbidden)
    if (response.status === 403) {
      try {
        const errorJson = (await response.json()) as TelegramAuthError;
        const reason =
          errorJson.reason || errorJson.message || "Аккаунт заблокирован";
        throw new UserBlockedError(reason);
      } catch (err) {
        if (err instanceof UserBlockedError) {
          throw err;
        }
      }
    }

    if (response.status === 401) {
      try {
        const errorJson = (await response.json()) as TelegramAuthError;
        if (errorJson?.code === "USER_BLOCKED") {
          throw new UserBlockedError(errorJson.message);
        }
      } catch (err) {
        if (err instanceof UserBlockedError) {
          throw err;
        }
      }
    }

    let serverMessage = "Ошибка авторизации";
    let serverCode: string | undefined;

    if (response.status === 400) {
      serverMessage = "Неверный формат запроса";
    } else if (response.status === 401) {
      serverMessage = "Неавторизован";
    } else if (response.status === 403) {
      serverMessage = "Доступ запрещен";
    } else if (response.status === 429) {
      serverMessage = "Слишком много запросов. Попробуйте позже.";
    }

    try {
      const errorJson = await response.json();
      serverMessage = errorJson?.message ?? serverMessage;
      serverCode = errorJson?.code;
    } catch {
      try {
        const text = await response.text();
        serverMessage = text || serverMessage;
      } catch {
        // Игнорируем ошибки парсинга
      }
    }
    const composed = `[${response.status}] ${serverMessage}${
      serverCode ? ` (${serverCode})` : ""
    }`;
    throw new Error(composed);
  }

  const data = await response.json();
  return data;
}
