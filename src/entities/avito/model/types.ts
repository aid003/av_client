export interface AvitoAccount {
  id: string;
  companyUserId: string;
  label: string;
  scope: string;
  expiresAt: string;
  refreshExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvitoAccountsResponse {
  accounts: AvitoAccount[];
  total: number;
}

export interface AvitoAccountsError {
  message: string;
  statusCode: number;
}

