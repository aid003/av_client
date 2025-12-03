// Lead status enum
export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'LOST';

// Lead source enum
export type LeadSource = 'AVITO_CHAT' | 'MANUAL' | 'OTHER';

// Slot value (custom data from script)
export interface LeadSlotValue {
  slot: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'enum';
}

// Main Lead entity
export interface Lead {
  id: string;
  tenantId: string;
  avitoChatId?: string;
  scriptId?: string;
  scriptName?: string; // For display purposes
  clientName?: string;
  phone?: string;
  budget?: number;
  status: LeadStatus;
  source: LeadSource;
  finished: boolean;
  slots?: LeadSlotValue[];
  currentBlockId?: string;
  createdAt: string;
  updatedAt: string;
}

// API DTOs
export interface CreateLeadDto {
  avitoChatId?: string;
  scriptId?: string;
  clientName?: string;
  phone?: string;
  budget?: number;
  status?: LeadStatus;
  source?: LeadSource;
  finished?: boolean;
  slots?: LeadSlotValue[];
}

export interface UpdateLeadDto {
  clientName?: string;
  phone?: string;
  budget?: number;
  status?: LeadStatus;
  finished?: boolean;
  slots?: LeadSlotValue[];
}

// API Query params
export interface LeadFilters {
  status?: LeadStatus;
  finished?: boolean;
  scriptId?: string;
  phone?: string;
  minBudget?: number;
  hasPhone?: boolean;
  fromUpdatedAt?: string;
  toUpdatedAt?: string;
  avitoChatId?: string;
}

export interface LeadListParams extends LeadFilters {
  page?: number;
  perPage?: number;
}

// API Response
export interface LeadListResponse {
  data: Lead[];
  total: number;
  page: number;
  perPage: number;
}

export interface LeadDetailsDto extends Lead {
  // Extended details if needed
}
