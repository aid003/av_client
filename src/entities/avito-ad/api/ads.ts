import { apiClient } from '@/shared/api';
import type {
  AvitoAdsResponse,
  AvitoAdsSyncResponse,
  GetAvitoAdsParams,
} from '../model/types';

/**
 * Получить список объявлений Avito для тенанта с пагинацией
 */
export async function getAvitoAds(
  tenantId: string,
  params: GetAvitoAdsParams = {}
): Promise<AvitoAdsResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params.page) queryParams.page = params.page;
  if (params.perPage) queryParams.perPage = params.perPage;
  if (params.status) queryParams.status = params.status;
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  if (params.search) queryParams.search = params.search;

  return apiClient.get<AvitoAdsResponse>(
    `/api/avito-ads/tenant/${tenantId}`,
    queryParams
  );
}

/**
 * Синхронизировать объявления Avito для всех аккаунтов тенанта
 */
export async function syncAvitoAds(
  tenantId: string
): Promise<AvitoAdsSyncResponse> {
  return apiClient.post<AvitoAdsSyncResponse>(
    `/api/avito-ads/sync/tenant/${tenantId}`
  );
}
