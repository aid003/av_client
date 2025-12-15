import { apiClient } from '@/shared/api/client';
import type {
  TenantSearchParams,
  TenantSearchResponse,
} from '../model/types';

export async function searchTenants(
  params: TenantSearchParams,
  initData: string
): Promise<TenantSearchResponse> {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params.search) {
    queryParams.search = params.search;
  }

  if (params.registeredFrom) {
    queryParams.registeredFrom = params.registeredFrom;
  }

  if (params.page !== undefined) {
    queryParams.page = params.page;
  }

  if (params.perPage !== undefined) {
    queryParams.perPage = params.perPage;
  }

  const headers: Record<string, string> = {
    'x-telegram-init-data': initData,
  };

  return apiClient.get<TenantSearchResponse>(
    '/api/tenant-search',
    queryParams,
    { headers }
  );
}
