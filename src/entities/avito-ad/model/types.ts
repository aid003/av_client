export interface AvitoAdCategory {
  id: number;
  name: string;
}

export interface AvitoAdVas {
  vas_id: string;
  finish_time: string;
  schedule: string[];
}

export interface AvitoAd {
  id: string;
  avitoAccountId: string;
  itemId: string;
  autoloadItemId: string | null;
  title: string;
  category: AvitoAdCategory;
  price: string;
  address: string;
  status: 'ACTIVE' | 'REMOVED' | 'OLD' | 'BLOCKED' | 'REJECTED' | 'NOT_FOUND' | 'ANOTHER_USER';
  url: string;
  startTime: string | null;
  finishTime: string | null;
  vas: AvitoAdVas[] | null;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvitoAdsPaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface AvitoAdsResponse {
  meta: AvitoAdsPaginationMeta;
  data: AvitoAd[];
}

export interface AdKnowledgeBaseLink {
  id: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdKnowledgeBaseLinksResponse {
  data: AdKnowledgeBaseLink[];
  total: number;
}

export interface AvitoAdsSyncResponse {
  success: boolean;
  message: string;
  syncedCount: number;
  createdCount: number;
  updatedCount: number;
}

export interface GetAvitoAdsParams {
  page?: number;
  perPage?: number;
  status?: string;
  categoryId?: number;
  search?: string;
}
