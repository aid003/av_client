import { apiClient } from '@/shared/api';
import type { SearchQueryDto, SearchResultDto } from '@/entities/knowledge-base';

/**
 * Семантический поиск по базе знаний
 */
export async function searchKnowledgeBase(
  tenantId: string,
  query: SearchQueryDto
): Promise<SearchResultDto> {
  return apiClient.post<SearchResultDto, SearchQueryDto>(
    `/api/knowledge-bases/search?tenantId=${tenantId}`,
    query
  );
}
