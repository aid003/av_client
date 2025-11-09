import type { VoiceFilesResponse, MessageError } from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getVoiceFiles(
  tenantId: string,
  accountId: string,
  voiceIds: string[]
): Promise<VoiceFilesResponse> {
  const voiceIdsParam = voiceIds.join(",");
  const response = await fetch(
    `${API_BASE_URL}/messenger/${tenantId}/accounts/${accountId}/voice-files?voiceIds=${voiceIdsParam}`,
    {
      method: "GET",
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

