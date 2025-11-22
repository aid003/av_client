import { apiClient } from '@/shared/api';
import type {
  AvitoAccount,
  AuthorizeRequest,
  AuthorizeResponse,
} from '../model/types';

/**
 * Получить список аккаунтов Avito для тенанта
 */
export async function getAvitoAccounts(tenantId: string): Promise<AvitoAccount[]> {
  return apiClient.get<AvitoAccount[]>(
    `/api/avito-oauth/accounts/tenant/${tenantId}`
  );
}

/**
 * Удалить аккаунт Avito
 */
export async function deleteAvitoAccount(accountId: string): Promise<void> {
  return apiClient.delete<void>(`/api/avito-oauth/accounts/${accountId}`);
}

/**
 * Получить URL для авторизации через Avito OAuth
 */
export async function getAuthorizeUrl(
  data: AuthorizeRequest
): Promise<AuthorizeResponse> {
  return apiClient.post<AuthorizeResponse, AuthorizeRequest>(
    '/api/avito-oauth/authorize',
    data
  );
}
