import { config } from "@/shared/lib/config";
import type { MessagesResponse, MessageError } from "../model/types";

export async function getMessages(
  tenantId: string,
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessagesResponse> {
  const params = new URLSearchParams();
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const url = `${config.apiBaseUrl}/messenger/${tenantId}/conversations/${conversationId}/messages?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error: MessageError = {
        message: "Диалог не найден",
        statusCode: 404,
      };
      throw error;
    }

    const error: MessageError = {
      message: "Ошибка при получении сообщений",
      statusCode: response.status,
    };
    throw error;
  }

  const data: MessagesResponse = await response.json();
  return data;
}

