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

/**
 * Типы для webhook
 */
export interface WebhookInfo {
  id: string;
  avitoAccountId: string;
  url: string;
  version: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Получить информацию о webhook для аккаунта
 */
export async function getWebhookStatus(accountId: string): Promise<WebhookInfo | null> {
  const url = `${config.apiBaseUrl}/api/avito-messenger/webhook/${accountId}`;

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Ошибка при получении статуса webhook: ${response.status}`);
  }

  return await response.json();
}

/**
 * Зарегистрировать webhook для получения сообщений
 */
export async function registerWebhook(accountId: string): Promise<void> {
  const url = `${config.apiBaseUrl}/api/avito-messenger/register/${accountId}`;
  const webhookUrl = `${config.apiBaseUrl}/api/avito-webhook/${accountId}`;

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Некорректный URL или ошибка регистрации');
    }
    if (response.status === 404) {
      throw new Error('Аккаунт не найден');
    }
    throw new Error(`Ошибка при регистрации webhook: ${response.status}`);
  }
}

/**
 * Отписаться от webhook уведомлений
 */
export async function unsubscribeWebhook(accountId: string): Promise<void> {
  const url = `${config.apiBaseUrl}/api/avito-messenger/webhook/${accountId}`;

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
      throw new Error('Webhook не найден');
    }
    if (response.status === 400) {
      throw new Error('Ошибка отписки от webhook');
    }
    throw new Error(`Ошибка при отписке от webhook: ${response.status}`);
  }
}

