export interface TelegramAuthResponse {
  tenant: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
    languageCode?: string;
  };
}

export interface TelegramAuthRequest {
  initData: string;
}

export interface TelegramAuthError {
  message: string;
  code?: string;
  error?: string;
  reason?: string;
  statusCode?: number;
}

