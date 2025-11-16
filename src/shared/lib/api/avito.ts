import { config } from '@/shared/lib/config';
import type {
  AvitoAccount,
  AuthorizeRequest,
  AuthorizeResponse,
} from '@/entities/avito-account';

/**
 * Получить список аккаунтов Avito для тенанта
 */
export async function getAvitoAccounts(tenantId: string): Promise<AvitoAccount[]> {
  const url = `${config.apiBaseUrl}/api/avito-oauth/accounts/tenant/${tenantId}`;

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Тенант не найден');
    }
    throw new Error(`Ошибка при загрузке аккаунтов: ${response.status}`);
  }

  return await response.json();
}

/**
 * Удалить аккаунт Avito
 */
export async function deleteAvitoAccount(accountId: string): Promise<void> {
  const url = `${config.apiBaseUrl}/api/avito-oauth/accounts/${accountId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Аккаунт не найден');
    }
    throw new Error(`Ошибка при удалении аккаунта: ${response.status}`);
  }
}

/**
 * Получить URL для авторизации через Avito OAuth
 */
export async function getAuthorizeUrl(
  data: AuthorizeRequest
): Promise<AuthorizeResponse> {
  const url = `${config.apiBaseUrl}/api/avito-oauth/authorize`;

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Некорректные данные для авторизации');
    }
    throw new Error(`Ошибка при получении URL авторизации: ${response.status}`);
  }

  return await response.json();
}

