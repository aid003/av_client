/**
 * Централизованные сообщения об ошибках для всего приложения
 */
export const ERROR_MESSAGES = {
  // Ошибки загрузки данных
  LOAD_ACCOUNTS: 'Ошибка при загрузке аккаунтов',
  LOAD_ADS: 'Ошибка при загрузке объявлений',
  LOAD_CHATS: 'Ошибка при загрузке чатов',
  LOAD_MESSAGES: 'Ошибка при загрузке сообщений',
  LOAD_WEBHOOK_STATUS: 'Ошибка при загрузке статуса webhook',
  LOAD_LEADS: 'Ошибка при загрузке лидов',
  LOAD_LEAD: 'Ошибка при загрузке лида',

  // Ошибки операций
  ADD_ACCOUNT: 'Ошибка при добавлении аккаунта',
  DELETE_ACCOUNT: 'Ошибка при удалении аккаунта',
  SYNC_ADS: 'Ошибка при синхронизации объявлений',
  REGISTER_WEBHOOK: 'Ошибка при регистрации webhook',
  UNREGISTER_WEBHOOK: 'Ошибка при отписке от webhook',
  CREATE_LEAD: 'Ошибка при создании лида',
  UPDATE_LEAD: 'Ошибка при обновлении лида',
  DELETE_LEAD: 'Ошибка при удалении лида',

  // Общие ошибки
  NETWORK_ERROR: 'Сервер временно недоступен. Попробуйте позже',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
  TIMEOUT_ERROR: 'Превышено время ожидания ответа от сервера',

  // Ошибки авторизации
  AUTH_ERROR: 'Ошибка авторизации',
  UNAUTHORIZED: 'Неавторизован',
  FORBIDDEN: 'Доступ запрещен',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
