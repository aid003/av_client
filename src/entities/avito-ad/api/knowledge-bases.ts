import { apiClient } from '@/shared/api';
import type { AdKnowledgeBaseLink, AdKnowledgeBaseLinksResponse } from '../model/types';

/**
 * Получить активные базы знаний, привязанные к объявлению (отсортированы по приоритету)
 */
export async function getAdKnowledgeBases(
  adId: string,
  tenantId: string
): Promise<AdKnowledgeBaseLinksResponse> {
  return apiClient.get<AdKnowledgeBaseLinksResponse>(
    `/api/avito-ads/${adId}/knowledge-bases`,
    { tenantId }
  );
}

export interface AttachKnowledgeBasesDto {
  knowledgeBaseIds: string[];
  priorities?: number[];
}

/**
 * Привязать одну или несколько баз знаний к объявлению
 * Если связь существует — обновляет приоритет
 */
export async function attachKnowledgeBasesToAd(
  adId: string,
  tenantId: string,
  data: AttachKnowledgeBasesDto
): Promise<AdKnowledgeBaseLinksResponse> {
  return apiClient.post<AdKnowledgeBaseLinksResponse, AttachKnowledgeBasesDto>(
    `/api/avito-ads/${adId}/knowledge-bases`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Удалить связь между объявлением и базой знаний
 */
export async function detachKnowledgeBaseFromAd(
  adId: string,
  kbId: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(
    `/api/avito-ads/${adId}/knowledge-bases/${kbId}`,
    undefined,
    { params: { tenantId } }
  );
}


