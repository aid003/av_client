import { config } from "@/shared/lib/config";
import type {
  WebhookSubscriptionsResponse,
  WebhookSubscribeResponse,
  WebhookUnsubscribeResponse,
  WebhookError,
} from "../model/types";

export async function getWebhookSubscriptions(
  tenantId: string,
  accountId: string
): Promise<WebhookSubscriptionsResponse> {
  const url = `${config.apiBaseUrl}/messenger/${tenantId}/accounts/${accountId}/webhooks/subscriptions`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const error: WebhookError = {
      message: "Ошибка при получении списка подписок",
      statusCode: response.status,
    };
    throw error;
  }

  const data: WebhookSubscriptionsResponse = await response.json();
  return data;
}

export async function subscribeWebhook(
  tenantId: string,
  accountId: string
): Promise<WebhookSubscribeResponse> {
  const url = `${config.apiBaseUrl}/messenger/${tenantId}/accounts/${accountId}/webhooks/subscribe`;

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error: WebhookError = {
      message: "Ошибка при регистрации webhook",
      statusCode: response.status,
    };
    throw error;
  }

  const data: WebhookSubscribeResponse = await response.json();
  return data;
}

export async function unsubscribeWebhook(
  tenantId: string,
  accountId: string
): Promise<WebhookUnsubscribeResponse> {
  const url = `${config.apiBaseUrl}/messenger/${tenantId}/accounts/${accountId}/webhooks/unsubscribe`;

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const error: WebhookError = {
      message: "Ошибка при отписке от webhook",
      statusCode: response.status,
    };
    throw error;
  }

  const data: WebhookUnsubscribeResponse = await response.json();
  return data;
}

