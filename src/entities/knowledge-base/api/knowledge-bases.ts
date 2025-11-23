import { apiClient } from '@/shared/api';
import type {
  KnowledgeBase,
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  KnowledgeBaseListResponse,
} from '../model/types';

/**
 * Получить список баз знаний для тенанта
 */
export async function getKnowledgeBases(
  tenantId: string,
  page = 1,
  perPage = 100
): Promise<KnowledgeBaseListResponse> {
  return apiClient.get<KnowledgeBaseListResponse>(
    `/api/knowledge-bases?tenantId=${tenantId}&page=${page}&perPage=${perPage}`
  );
}

/**
 * Получить одну базу знаний по ID
 */
export async function getKnowledgeBase(
  id: string,
  tenantId: string
): Promise<KnowledgeBase> {
  return apiClient.get<KnowledgeBase>(
    `/api/knowledge-bases/${id}?tenantId=${tenantId}`
  );
}

/**
 * Создать новую базу знаний
 */
export async function createKnowledgeBase(
  tenantId: string,
  data: CreateKnowledgeBaseDto
): Promise<KnowledgeBase> {
  return apiClient.post<KnowledgeBase, CreateKnowledgeBaseDto>(
    `/api/knowledge-bases?tenantId=${tenantId}`,
    data
  );
}

/**
 * Обновить базу знаний
 */
export async function updateKnowledgeBase(
  id: string,
  tenantId: string,
  data: UpdateKnowledgeBaseDto
): Promise<KnowledgeBase> {
  return apiClient.put<KnowledgeBase, UpdateKnowledgeBaseDto>(
    `/api/knowledge-bases/${id}?tenantId=${tenantId}`,
    data
  );
}

/**
 * Удалить базу знаний
 */
export async function deleteKnowledgeBase(
  id: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(
    `/api/knowledge-bases/${id}?tenantId=${tenantId}`
  );
}
