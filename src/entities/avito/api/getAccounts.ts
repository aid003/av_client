import { config } from '@/shared/lib/config';
import type { AvitoAccountsResponse, AvitoAccountsError } from '../model/types';

export async function getAvitoAccounts(
  tenantId: string
): Promise<AvitoAccountsResponse> {
  const url = `${config.apiBaseUrl}/oauth/accounts/${tenantId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      const error: AvitoAccountsError = {
        message: 'Тенант не найден',
        statusCode: 404,
      };
      throw error;
    }

    const error: AvitoAccountsError = {
      message: 'Ошибка при получении аккаунтов',
      statusCode: response.status,
    };
    throw error;
  }

  const data: AvitoAccountsResponse = await response.json();
  return data;
}

