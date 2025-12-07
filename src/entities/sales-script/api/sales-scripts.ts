import { apiClient } from '@/shared/api';
import type {
  SalesScript,
  CreateSalesScriptDto,
  UpdateSalesScriptDto,
  SalesScriptListResponse,
  ConstructorSchema,
  ScriptDefinition,
  ScriptSlot,
  SlotsListResponse,
  AddSlotDto,
  UpdateSlotDto,
  RenameSlotDto,
  ScriptValidationResult,
} from '../model/types';

/**
 * Получить список скриптов продаж для тенанта
 */
export async function getSalesScripts(
  tenantId: string,
  page = 1,
  perPage = 25
): Promise<SalesScriptListResponse> {
  return apiClient.get<SalesScriptListResponse>('/api/sales-scripts', {
    tenantId,
    page,
    perPage,
  });
}

/**
 * Получить один скрипт продаж по ID
 */
export async function getSalesScript(
  id: string,
  tenantId: string
): Promise<SalesScript> {
  return apiClient.get<SalesScript>(`/api/sales-scripts/${id}`, { tenantId });
}

/**
 * Создать новый скрипт продаж
 */
export async function createSalesScript(
  tenantId: string,
  data: CreateSalesScriptDto
): Promise<SalesScript> {
  return apiClient.post<SalesScript, CreateSalesScriptDto>(
    '/api/sales-scripts',
    data,
    { params: { tenantId } }
  );
}

/**
 * Обновить скрипт продаж
 */
export async function updateSalesScript(
  id: string,
  tenantId: string,
  data: UpdateSalesScriptDto
): Promise<SalesScript> {
  return apiClient.put<SalesScript, UpdateSalesScriptDto>(
    `/api/sales-scripts/${id}`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Удалить скрипт продаж
 */
export async function deleteSalesScript(
  id: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(`/api/sales-scripts/${id}`, undefined, {
    params: { tenantId },
  });
}

// ============================================
// Constructor Schema API
// ============================================

/**
 * Получить схему конструктора (типы блоков, слотов и т.д.)
 */
export async function getConstructorSchema(
  tenantId: string
): Promise<ConstructorSchema> {
  return apiClient.get<ConstructorSchema>('/api/sales-scripts/constructor-schema', {
    tenantId,
  });
}

// ============================================
// Validation API
// ============================================

/**
 * Валидировать definition скрипта
 */
export async function validateScriptDefinition(
  definition: ScriptDefinition
): Promise<ScriptValidationResult> {
  return apiClient.post<ScriptValidationResult, { definition: ScriptDefinition }>(
    `/api/sales-scripts/validate`,
    { definition }
  );
}

// ============================================
// Slots API
// ============================================

/**
 * Получить список слотов скрипта
 */
export async function getScriptSlots(
  scriptId: string,
  tenantId: string
): Promise<SlotsListResponse> {
  return apiClient.get<SlotsListResponse>(
    `/api/sales-scripts/${scriptId}/slots`,
    { tenantId }
  );
}

/**
 * Добавить слот в скрипт
 */
export async function addSlot(
  scriptId: string,
  tenantId: string,
  data: AddSlotDto
): Promise<ScriptSlot> {
  return apiClient.post<ScriptSlot, AddSlotDto>(
    `/api/sales-scripts/${scriptId}/slots`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Обновить слот
 */
export async function updateSlot(
  scriptId: string,
  slotName: string,
  tenantId: string,
  data: UpdateSlotDto
): Promise<ScriptSlot> {
  return apiClient.put<ScriptSlot, UpdateSlotDto>(
    `/api/sales-scripts/${scriptId}/slots/${slotName}`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Удалить слот
 */
export async function deleteSlot(
  scriptId: string,
  slotName: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(
    `/api/sales-scripts/${scriptId}/slots/${slotName}`,
    undefined,
    { params: { tenantId } }
  );
}

/**
 * Переименовать слот
 */
export async function renameSlot(
  scriptId: string,
  slotName: string,
  tenantId: string,
  data: RenameSlotDto
): Promise<ScriptSlot> {
  return apiClient.put<ScriptSlot, RenameSlotDto>(
    `/api/sales-scripts/${scriptId}/slots/${slotName}/rename`,
    data,
    { params: { tenantId } }
  );
}

// ============================================
// Script State API
// ============================================

/**
 * Удалить состояние выполнения скрипта (ChatScriptState и Lead)
 */
export async function deleteScriptState(
  scriptId: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(
    `/api/sales-scripts/${scriptId}/state`,
    undefined,
    { params: { tenantId } }
  );
}
