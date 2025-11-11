import type {
  SendMessageRequest,
  SendMessageResponse,
  MessageError,
} from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function sendMessage(
  tenantId: string,
  accountId: string,
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  // Удаляем undefined поля из запроса
  const cleanRequest: Record<string, unknown> = {
    chatId: request.chatId,
    text: request.text,
  };

  if (request.quotedMessageId) {
    cleanRequest.quotedMessageId = request.quotedMessageId;
  }

  const response = await fetch(
    `${API_BASE_URL}/messenger/${tenantId}/accounts/${accountId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanRequest),
    }
  );

  if (!response.ok) {
    const error: MessageError = await response.json();
    throw error;
  }

  return response.json();
}

