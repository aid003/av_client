import { config } from "@/shared/lib/config";
import type { Stats, ConversationError } from "../model/types";

export async function getStats(tenantId: string): Promise<Stats> {
  const url = `${config.apiBaseUrl}/messenger/${tenantId}/stats`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error: ConversationError = {
      message: "Ошибка при получении статистики",
      statusCode: response.status,
    };
    throw error;
  }

  const data: Stats = await response.json();
  return data;
}

