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
  const url = `${config.apiBaseUrl}/api/auth/telegram`;
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
    throw new Error("Сервер временно недоступен. Попробуйте позже.");
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[auth/telegram] status:", response.status);
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
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[auth/telegram] error JSON:", errorJson);
      }
    } catch {
      try {
        const text = await response.text();
        serverMessage = text || serverMessage;
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.log("[auth/telegram] error TEXT:", text);
        }
      } catch {}
    }
    const composed = `[${response.status}] ${serverMessage}${
      serverCode ? ` (${serverCode})` : ""
    }`;
    throw new Error(composed);
  }

  const data = await response.json();
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("[auth/telegram] data:", data);
  }
  return data;
}
