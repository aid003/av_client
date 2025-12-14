export interface ChunkingConfig {
  method: string;
  maxChunkSize: number;
  minChunkSize: number;
  splitOnParagraphs: boolean;
  splitOnSentences: boolean;
  preserveParagraphs: boolean;
  mergeSmallChunks: boolean;
}

export interface KnowledgeBase {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  chunkingConfig: ChunkingConfig;
  weaviateClassName?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeBaseDto {
  name: string;
  description?: string;
  chunkingConfig: ChunkingConfig;
}

export interface UpdateKnowledgeBaseDto {
  name?: string;
  description?: string;
  chunkingConfig?: ChunkingConfig;
}

export interface KnowledgeBaseListResponse {
  data: KnowledgeBase[];
  total: number;
  page: number;
  perPage: number;
}

export interface Chunk {
  id: string;
  knowledgeBaseId: string;
  text: string;
  weaviateId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTextDto {
  text: string;
  avitoAdId?: string;
}

export interface UploadTextResponseDto {
  chunks: Chunk[];
  totalChunks: number;
  knowledgeBaseId: string;
}

export interface UpdateChunkDto {
  text?: string;
  metadata?: Record<string, any>;
}

export interface DeleteChunksBatchDto {
  chunkIds: string[];
}

export interface DeleteChunksBatchResponseDto {
  deletedCount: number;
  failedCount: number;
}

export interface ChunkListResponseDto {
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  data: Chunk[];
}

// Search types
export type FusionType = 'Ranked' | 'RelativeScore';

export interface SearchQueryDto {
  query: string;
  knowledgeBaseIds?: string[];
  avitoAdId?: string;
  limit?: number;
  alpha?: number;
  fusionType?: FusionType;
}

export interface ChunkSearchResultDto {
  text: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  avitoAdId?: string;
  chunkIndex: number;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchResultDto {
  chunks: ChunkSearchResultDto[];
  total: number;
}
