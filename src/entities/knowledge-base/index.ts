// Types
export type {
  KnowledgeBase,
  CreateKnowledgeBaseDto,
  UpdateKnowledgeBaseDto,
  KnowledgeBaseListResponse,
  ChunkingConfig,
  Chunk,
  UploadTextDto,
  UploadTextResponseDto,
  UpdateChunkDto,
  DeleteChunksBatchDto,
  DeleteChunksBatchResponseDto,
  ChunkListResponseDto,
  SearchQueryDto,
  ChunkSearchResultDto,
  SearchResultDto,
  FusionType,
} from './model/types';

// API
export {
  getKnowledgeBases,
  getKnowledgeBase,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  uploadText,
  getChunks,
  getChunk,
  updateChunk,
  deleteChunk,
  deleteChunksBatch,
} from './api';

// Store
export {
  useKnowledgeBasesStore,
  useKnowledgeBasesForTenant,
  useKnowledgeBasesLoading,
  useKnowledgeBasesError,
  useKnowledgeBasesActions,
} from './model/store';

// UI
export { KnowledgeBaseCard } from './ui/KnowledgeBaseCard';
