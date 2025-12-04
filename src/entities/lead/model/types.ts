// Main Lead entity
export interface Lead {
  id: string;
  tenantId: string;
  avitoChatId?: string;
  scriptId?: string;
  scriptName?: string; // For display purposes (deprecated, use script.name)
  /** Client name - read-only, populated from chat participants */
  clientName?: string;
  finished: boolean;
  lastMessageAt: string;
  slots?: Record<string, unknown>;
  currentBlockId?: string;
  createdAt?: string;
  updatedAt?: string;
  chat?: {
    id: string;
    chatId: string;
    chatType: string;
    lastMessagePreview?: string;
  };
  script?: {
    id: string;
    name: string;
  };
}

// API DTOs
export interface CreateLeadDto {
  avitoChatId?: string;
  scriptId?: string;
  finished?: boolean;
  slots?: Record<string, unknown>;
}

export interface UpdateLeadDto {
  finished?: boolean;
  slots?: Record<string, unknown>;
}

// API Query params
export interface LeadFilters {
  finished?: boolean;
  scriptId?: string;
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
