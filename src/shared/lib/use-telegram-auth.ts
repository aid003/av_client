import { useAuthStore } from './store';

/**
 * Хук для работы с Telegram авторизацией
 * Wrapper над AuthStore для удобного использования
 */
export function useTelegramAuth() {
  const { authData, isAuthenticating } = useAuthStore();

  return {
    authData,
    isAuthenticating,
    isLoading: isAuthenticating,
    isAuthenticated: !!authData,
    tenantId: authData?.tenant?.id,
    isBlocked: false, // Not in response, always false
  };
}
