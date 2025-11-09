import { config } from "@/shared/lib/config";
import type { ConversationDetails, ConversationError } from "../model/types";

export async function getConversation(
  tenantId: string,
  conversationId: string
): Promise<ConversationDetails> {
  const url = `${config.apiBaseUrl}/messenger/${tenantId}/conversations/${conversationId}`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error: ConversationError = {
        message: "Диалог не найден",
        statusCode: 404,
      };
      throw error;
    }

    const error: ConversationError = {
      message: "Ошибка при получении информации о диалоге",
      statusCode: response.status,
    };
    throw error;
  }

  const data: ConversationDetails = await response.json();
  return data;
}

