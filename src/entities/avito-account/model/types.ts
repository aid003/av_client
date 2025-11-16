export interface AvitoAccount {
  id: string;
  tenantId: string;
  companyUserId: number;
  expiresAt: string;
  tokenType: string;
  grantType: string;
  refreshExpiresAt: string;
  scope: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorizeRequest {
  tenantId: string;
  scopes: string;
  returnUrl: string;
  label: string;
}

export interface AuthorizeResponse {
  authorizationUrl: string;
  state: string;
}

