import { config } from "@/shared/lib/config";
import type {
  ConversationsResponse,
  ConversationFilters,
  ConversationError,
} from "../model/types";

export async function getConversations(
  tenantId: string,
  filters?: ConversationFilters
): Promise<ConversationsResponse> {
  const params = new URLSearchParams();

  if (filters?.accountId) params.append("accountId", filters.accountId);
  if (filters?.unreadOnly) params.append("unreadOnly", "true");
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const url = `${config.apiBaseUrl}/messenger/${tenantId}/conversations${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error: ConversationError = {
      message: "Ошибка при получении списка диалогов",
      statusCode: response.status,
    };
    throw error;
  }

  const data: ConversationsResponse = await response.json();
  return data;
}

