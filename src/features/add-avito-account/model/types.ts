export interface AuthUrlRequest {
  tenantId: string;
  scopes: string;
  redirectAfter: string;
  mode: "createOrUpdate";
  label: string;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface AuthUrlError {
  message: string;
  statusCode: number;
}

