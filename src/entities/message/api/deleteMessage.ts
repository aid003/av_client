import type { DeleteMessageResponse, MessageError } from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function deleteMessage(
  tenantId: string,
  accountId: string,
  chatId: string,
  messageId: string
): Promise<DeleteMessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/messenger/${tenantId}/accounts/${accountId}/chats/${chatId}/messages/${messageId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error: MessageError = await response.json();
    throw error;
  }

  return response.json();
}

