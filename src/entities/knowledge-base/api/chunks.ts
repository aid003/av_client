import { apiClient } from '@/shared/api';
import type {
  Chunk,
  UploadTextDto,
  UploadTextResponseDto,
  UpdateChunkDto,
  DeleteChunksBatchDto,
  DeleteChunksBatchResponseDto,
  ChunkListResponseDto,
} from '../model/types';

/**
 * Загрузить текст в базу знаний (создает чанки)
 */
export async function uploadText(
  knowledgeBaseId: string,
  tenantId: string,
  data: UploadTextDto
): Promise<UploadTextResponseDto> {
  return apiClient.post<UploadTextResponseDto, UploadTextDto>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks?tenantId=${tenantId}`,
    data
  );
}

/**
 * Получить список чанков базы знаний
 */
export async function getChunks(
  knowledgeBaseId: string,
  tenantId: string,
  page = 1,
  perPage = 25
): Promise<ChunkListResponseDto> {
  return apiClient.get<ChunkListResponseDto>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks?tenantId=${tenantId}&page=${page}&perPage=${perPage}`
  );
}

/**
 * Получить один чанк по ID
 */
export async function getChunk(
  knowledgeBaseId: string,
  chunkId: string,
  tenantId: string
): Promise<Chunk> {
  return apiClient.get<Chunk>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks/${chunkId}?tenantId=${tenantId}`
  );
}

/**
 * Обновить чанк
 */
export async function updateChunk(
  knowledgeBaseId: string,
  chunkId: string,
  tenantId: string,
  data: UpdateChunkDto
): Promise<Chunk> {
  return apiClient.put<Chunk, UpdateChunkDto>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks/${chunkId}?tenantId=${tenantId}`,
    data
  );
}

/**
 * Удалить один чанк
 */
export async function deleteChunk(
  knowledgeBaseId: string,
  chunkId: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void, never>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks/${chunkId}?tenantId=${tenantId}`,
    undefined
  );
}

/**
 * Пакетное удаление чанков
 */
export async function deleteChunksBatch(
  knowledgeBaseId: string,
  tenantId: string,
  data: DeleteChunksBatchDto
): Promise<DeleteChunksBatchResponseDto> {
  return apiClient.delete<DeleteChunksBatchResponseDto, DeleteChunksBatchDto>(
    `/api/knowledge-bases/${knowledgeBaseId}/chunks/batch?tenantId=${tenantId}`,
    data
  );
}
