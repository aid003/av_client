export interface TelegramAuthResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
}

export interface TelegramAuthRequest {
  initData: string;
}

export interface TelegramAuthError {
  message: string;
  code: 'INVALID_INIT_DATA' | 'INVALID_SIGNATURE' | 'INTERNAL_ERROR';
}

