'use client';

import { useAuthStore } from '@/shared/lib/store';

export function useTelegramAuth() {
  const authData = useAuthStore((state) => state.authData);
  
  return { authData, isLoading: false };
}

