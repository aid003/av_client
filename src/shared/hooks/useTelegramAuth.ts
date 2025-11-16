'use client';

import { useAuthStore } from '@/shared/lib/store';

export function useTelegramAuth() {
  const authData = useAuthStore((state) => state.authData);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);

  return {
    authData,
    isLoading: isAuthenticating,
    isAuthenticated: Boolean(authData && !isAuthenticating)
  };
}

