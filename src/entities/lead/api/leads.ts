import { apiClient } from '@/shared/api/client';
import type {
  Lead,
  LeadListResponse,
  LeadDetailsDto,
  CreateLeadDto,
  UpdateLeadDto,
  LeadListParams,
} from '../model/types';

/**
 * Get list of leads for a tenant with optional filters
 */
export async function getLeads(
  tenantId: string,
  params?: LeadListParams
): Promise<LeadListResponse> {
  // Filter out undefined values to prevent them from being sent as "undefined" strings
  const cleanedParams = params
    ? Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>)
    : {};

  return apiClient.get<LeadListResponse>('/api/crm/leads', {
    tenantId,
    ...cleanedParams,
  });
}

/**
 * Get lead details by ID
 */
export async function getLeadById(
  tenantId: string,
  leadId: string
): Promise<LeadDetailsDto> {
  return apiClient.get<LeadDetailsDto>(`/api/crm/leads/${leadId}`, {
    tenantId,
  });
}

/**
 * Create a new lead
 */
export async function createLead(
  tenantId: string,
  data: CreateLeadDto
): Promise<Lead> {
  return apiClient.post<Lead>('/api/crm/leads', data, {
    params: { tenantId },
  });
}

/**
 * Update an existing lead
 */
export async function updateLead(
  tenantId: string,
  leadId: string,
  data: UpdateLeadDto
): Promise<Lead> {
  return apiClient.patch<Lead>(`/api/crm/leads/${leadId}`, data, {
    params: { tenantId },
  });
}

/**
 * Delete a lead
 */
export async function deleteLead(
  tenantId: string,
  leadId: string
): Promise<void> {
  return apiClient.delete<void>(`/api/crm/leads/${leadId}`, undefined, {
    params: { tenantId },
  });
}

/**
 * Get lead by chat ID (for chat integration)
 */
export async function getLeadByChatId(
  tenantId: string,
  chatId: string
): Promise<Lead | null> {
  try {
    const response = await getLeads(tenantId, { avitoChatId: chatId });
    return response.data[0] || null;
  } catch {
    return null;
  }
}
