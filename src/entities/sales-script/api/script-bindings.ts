import { apiClient } from '@/shared/api';
import type {
  ScriptBinding,
  CreateScriptBindingDto,
  UpdateScriptBindingDto,
  ScriptBindingsResponse,
} from '../model/types';

/**
 * Создать привязку скрипта к объявлению/аккаунту
 */
export async function createScriptBinding(
  scriptId: string,
  tenantId: string,
  data: CreateScriptBindingDto
): Promise<ScriptBinding> {
  return apiClient.post<ScriptBinding, CreateScriptBindingDto>(
    `/api/sales-scripts/${scriptId}/bindings`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Получить привязки скрипта
 */
export async function getScriptBindings(
  scriptId: string,
  tenantId: string
): Promise<ScriptBindingsResponse> {
  return apiClient.get<ScriptBindingsResponse>(
    `/api/sales-scripts/${scriptId}/bindings`,
    { tenantId }
  );
}

/**
 * Получить привязки для объявления
 */
export async function getAdScriptBindings(
  adId: string,
  tenantId: string
): Promise<ScriptBindingsResponse> {
  return apiClient.get<ScriptBindingsResponse>(
    `/api/avito-ads/${adId}/script-bindings`,
    { tenantId }
  );
}

/**
 * Обновить привязку
 */
export async function updateScriptBinding(
  bindingId: string,
  tenantId: string,
  data: UpdateScriptBindingDto
): Promise<ScriptBinding> {
  return apiClient.put<ScriptBinding, UpdateScriptBindingDto>(
    `/api/script-bindings/${bindingId}`,
    data,
    { params: { tenantId } }
  );
}

/**
 * Удалить привязку
 */
export async function deleteScriptBinding(
  bindingId: string,
  tenantId: string
): Promise<void> {
  return apiClient.delete<void>(`/api/script-bindings/${bindingId}`, undefined, {
    params: { tenantId },
  });
}