import type {
  AddToBlacklistRequest,
  AddToBlacklistResponse,
  MessageError,
} from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function addToBlacklist(
  tenantId: string,
  accountId: string,
  request: AddToBlacklistRequest
): Promise<AddToBlacklistResponse> {
  const response = await fetch(
    `${API_BASE_URL}/messenger/${tenantId}/accounts/${accountId}/blacklist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error: MessageError = await response.json();
    throw error;
  }

  return response.json();
}

