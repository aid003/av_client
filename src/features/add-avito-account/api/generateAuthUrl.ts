import { config } from "@/shared/lib/config";
import type {
  AuthUrlRequest,
  AuthUrlResponse,
  AuthUrlError,
} from "../model/types";

export async function generateAuthUrl(
  request: AuthUrlRequest
): Promise<AuthUrlResponse> {
  const url = `${config.apiBaseUrl}/oauth/auth-url`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error: AuthUrlError = {
        message: "Тенант не найден",
        statusCode: 404,
      };
      throw error;
    }

    if (response.status === 400) {
      const error: AuthUrlError = {
        message: "Ошибка запроса",
        statusCode: 400,
      };
      throw error;
    }

    const error: AuthUrlError = {
      message: "Ошибка при генерации URL авторизации",
      statusCode: response.status,
    };
    throw error;
  }

  const data: AuthUrlResponse = await response.json();
  return data;
}

