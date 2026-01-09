export type ThemeMode = 'auto' | 'light' | 'dark';

export interface UserSettings {
  notificationsEnabled: boolean;
  theme: ThemeMode;
}

export interface TelegramSettings {
  notificationsEnabled: boolean;
}

export interface UpdateTelegramSettingsRequest {
  notificationsEnabled: boolean;
}
