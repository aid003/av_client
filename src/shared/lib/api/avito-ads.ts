import { config } from '@/shared/lib/config';
import type {
  AvitoAdsResponse,
  AvitoAdsSyncResponse,
  GetAvitoAdsParams,
} from '@/entities/avito-ad';

/**
 * Получить список объявлений Avito для тенанта с пагинацией
 */
export async function getAvitoAds(
  tenantId: string,
  params: GetAvitoAdsParams = {}
): Promise<AvitoAdsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.perPage) searchParams.set('perPage', params.perPage.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId.toString());
  if (params.search) searchParams.set('search', params.search);

  const queryString = searchParams.toString();
  const url = `${config.apiBaseUrl}/api/avito-ads/tenant/${tenantId}${queryString ? `?${queryString}` : ''}`;

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
    throw new Error(`Ошибка при загрузке объявлений: ${response.status}`);
  }

  return await response.json();
}

/**
 * Синхронизировать объявления Avito для всех аккаунтов тенанта
 */
export async function syncAvitoAds(tenantId: string): Promise<AvitoAdsSyncResponse> {
  const url = `${config.apiBaseUrl}/api/avito-ads/sync/tenant/${tenantId}`;

  const response = await fetch(url, {
    method: 'POST',
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
    if (response.status === 429) {
      throw new Error('Превышен лимит запросов к Avito API. Попробуйте позже.');
    }
    throw new Error(`Ошибка при синхронизации: ${response.status}`);
  }

  return await response.json();
}
