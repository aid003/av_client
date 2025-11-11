export interface AvitoAccount {
  id: string;
  companyUserId: string;
  label: string | null;
  scope: string;
  expiresAt: string;
  refreshExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvitoAccountsResponse {
  accounts: AvitoAccount[];
  total: number;
}

export interface AvitoAccountsError {
  message: string;
  statusCode: number;
}

export interface WebhookSubscription {
  url: string;
  version: string;
}

export interface WebhookSubscriptionsResponse {
  subscriptions: WebhookSubscription[];
}

export interface WebhookSubscribeResponse {
  ok: boolean;
  webhookUrl: string;
}

export interface WebhookUnsubscribeResponse {
  ok: boolean;
}

export interface WebhookError {
  message: string;
  statusCode: number;
}
