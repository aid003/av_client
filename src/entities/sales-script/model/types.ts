// ============================================
// Script Definition Types (граф скрипта)
// ============================================

/** Типы блоков скрипта */
export type ScriptBlockType =
  | 'START'
  | 'MESSAGE'
  | 'QUESTION'
  | 'ROUTER'
  | 'LLM_REPLY'
  | 'END';

/** Типы условий переходов */
export type EdgeConditionType = 'ALWAYS' | 'YES' | 'NO' | 'OTHER';

/** Типы слотов */
export type SlotType = 'string' | 'number' | 'boolean' | 'enum';

/** Режимы роутера */
export type RouterMode = 'YES_NO_OTHER';

/** Стиль ответа LLM */
export type LLMReplyStyle = 'SHORT' | 'NORMAL' | 'DETAILED';

// ============================================
// LLM Settings Types
// ============================================

/**
 * Глобальные настройки LLM для скрипта
 */
export interface LlmScriptSettings {
  /** Модели по умолчанию для разных операций */
  defaultModels?: {
    generateReply?: string;
    classifyYesNoOther?: string;
    extractSlots?: string;
    isAnswerRelevant?: string;
    rephraseQuestion?: string;
    normalizeSlotValue?: string;
  };

  /** Кастомные системные промпты по умолчанию */
  defaultPrompts?: {
    generateReply?: string;
    classifyYesNoOther?: string;
    extractSlots?: string;
    isAnswerRelevant?: string;
    rephraseQuestion?: string;
    normalizeSlotValue?: string;
  };

  /** Температура по умолчанию (0-1) */
  defaultTemperature?: number;

  /** Максимальное количество токенов по умолчанию */
  defaultMaxTokens?: number;
}

// --- Конфигурации блоков ---

export interface StartBlockConfig {
  // Обычно пустая конфигурация
}

export interface MessageBlockConfig {
  text: string;
  enableTemplating?: boolean;
  delaySeconds?: number;
}

export interface QuestionBlockConfig {
  slot: string;
  text: string;
  required?: boolean;
  hintForLLM?: string;
  maxRetries?: number;
  delaySeconds?: number;

  // LLM настройки для извлечения слотов
  extractModel?: string;
  extractSystemPrompt?: string;

  // LLM настройки для переспроса
  rephraseModel?: string;
  rephraseSystemPrompt?: string;
}

export interface RouterBlockConfig {
  mode: RouterMode;
  instruction: string;

  // LLM настройки
  model?: string;
  systemPrompt?: string;
}

export interface LLMReplyBlockConfig {
  instruction: string;
  useKnowledgeBase?: boolean;
  maxTokens?: number;
  temperature?: number;
  style?: LLMReplyStyle;
  delaySeconds?: number;

  // LLM настройки
  model?: string;
  systemPrompt?: string;
}

export interface EndBlockConfig {
  reason?: string;
}

export type ScriptBlockConfig =
  | StartBlockConfig
  | MessageBlockConfig
  | QuestionBlockConfig
  | RouterBlockConfig
  | LLMReplyBlockConfig
  | EndBlockConfig;

// --- Блок скрипта ---

export interface ScriptBlock<T extends ScriptBlockConfig = ScriptBlockConfig> {
  id: string;
  type: ScriptBlockType;
  title: string;
  x: number;
  y: number;
  config: T;
}

// --- Условие перехода ---

export interface EdgeCondition {
  type: EdgeConditionType;
}

// --- Связь между блоками ---

export interface ScriptEdge {
  id: string;
  from: string;
  to: string;
  condition: EdgeCondition;
  label?: string;
}

// --- Слот (данные о клиенте) ---

export interface ScriptSlot {
  name: string;
  type: SlotType;
  description?: string;
  required?: boolean;
  enumValues?: string[];
}

// --- Метаданные скрипта ---

export interface ScriptMeta {
  name: string;
  description?: string;
  slots: ScriptSlot[];

  /**
   * Автоматическое предзаполнение слотов из первого сообщения пользователя.
   * Если установлено в `true`, система попытается извлечь значения всех слотов
   * из первого сообщения после запуска скрипта, используя LLM.
   * По умолчанию: `false` (функция отключена).
   */
  autoFillSlotsFromFirstMessage?: boolean;

  /**
   * Общие настройки LLM для этого скрипта
   */
  llmSettings?: LlmScriptSettings;

  /**
   * Настройки времени прочтения сообщений
   */
  readTiming?: {
    /** Задержка для первого сообщения (секунды) */
    firstMessageDelaySeconds?: number;
    /** Задержка для последующих сообщений (секунды) */
    subsequentMessageDelaySeconds?: number;
  };
}

// --- Полная структура definition ---

export interface ScriptDefinition {
  version: number;
  meta: ScriptMeta;
  blocks: ScriptBlock[];
  edges: ScriptEdge[];
}

// ============================================
// Constructor Schema Types (от API)
// ============================================

export interface BlockTypeSchema {
  type: ScriptBlockType;
  label: string;
  description: string;
  maxCount?: number;
  configSchema: Record<string, unknown>;
}

export interface ConstructorSchema {
  version: number;
  blockTypes: BlockTypeSchema[];
  slotTypes: SlotType[];
  edgeConditionTypes: EdgeConditionType[];
  routerModes: RouterMode[];
}

// ============================================
// Validation Types
// ============================================

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================
// Sales Script Entity
// ============================================

export interface SalesScript {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  definition: ScriptDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesScriptDto {
  name: string;
  description?: string;
  definition?: ScriptDefinition;
  isActive?: boolean;
}

export interface UpdateSalesScriptDto {
  name?: string;
  description?: string;
  definition?: ScriptDefinition;
  isActive?: boolean;
}

// ============================================
// Slots API DTOs
// ============================================

export interface AddSlotDto {
  slot: ScriptSlot;
}

export interface UpdateSlotDto {
  type?: SlotType;
  enumValues?: string[];
  description?: string;
  required?: boolean;
}

export interface RenameSlotDto {
  newName: string;
}

export interface SlotsListResponse {
  data: ScriptSlot[];
  total: number;
}

export interface SalesScriptListResponse {
  data: SalesScript[];
  total: number;
  page: number;
  perPage: number;
}

export interface ScriptBinding {
  id: string;
  salesScriptId: string;
  salesScriptName: string;
  avitoAdId?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptBindingDto {
  avitoAccountId?: string;
  avitoAdId?: string;
  priority: number;
  isActive?: boolean;
}

export interface UpdateScriptBindingDto {
  priority?: number;
  isActive?: boolean;
}

export interface ScriptBindingsResponse {
  data: ScriptBinding[];
  total: number;
}

// ============================================
// LLM Metadata API Types
// ============================================

/**
 * Информация о доступной модели LLM
 */
export interface LlmModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
}

/**
 * Информация об операции LLM
 */
export interface LlmOperationInfo {
  id: string;
  name: string;
  description: string;
  defaultModel: string;
}

/**
 * Шаблоны промптов для операций
 */
export interface LlmPromptTemplate {
  default: string;
  description: string;
}

/**
 * Ответ от API /api/llm/metadata
 */
export interface LlmMetadataResponse {
  availableModels: LlmModelInfo[];
  availableOperations: LlmOperationInfo[];
  promptTemplates: Record<string, LlmPromptTemplate>;
}
