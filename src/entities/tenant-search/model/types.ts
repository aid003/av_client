export interface TelegramUser {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
  createdAt: string;
}

export interface TenantSearchResult {
  tenantId: string;
  telegramUser: TelegramUser;
}

export interface TenantSearchParams {
  search?: string;
  registeredFrom?: string; // ISO date
  page?: number;
  perPage?: number; // 1-100
}

export interface TenantSearchMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface TenantSearchResponse {
  meta: TenantSearchMeta;
  data: TenantSearchResult[];
}
