import type {
  MarkAsReadRequest,
  MarkAsReadResponse,
  MessageError,
} from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function markMessagesAsRead(
  tenantId: string,
  conversationId: string,
  request?: MarkAsReadRequest
): Promise<MarkAsReadResponse> {
  const response = await fetch(
    `${API_BASE_URL}/messenger/${tenantId}/conversations/${conversationId}/messages/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request || {}),
    }
  );

  if (!response.ok) {
    const error: MessageError = await response.json();
    throw error;
  }

  return response.json();
}

