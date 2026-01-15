'use client';

import { useEffect, type ReactNode } from 'react';
import { extractImpersonationTokenFromUrl, isValidImpersonationToken, stripImpersonationTokenFromUrl } from '@/shared/lib/impersonation';
import { useImpersonationStore } from '@/shared/lib/impersonation-store';
import { ImpersonationBanner } from '@/shared/ui/impersonation/ImpersonationBanner';
import { ImpersonationSystemMessage } from '@/shared/ui/impersonation/ImpersonationSystemMessage';

interface ImpersonationProviderProps {
  children: ReactNode;
}

export function ImpersonationProvider({ children }: ImpersonationProviderProps) {
  const setToken = useImpersonationStore((state) => state.setToken);
  const hydrateFromStorage = useImpersonationStore((state) => state.hydrateFromStorage);
  const exit = useImpersonationStore((state) => state.exit);

  useEffect(() => {
    const tokenFromUrl = extractImpersonationTokenFromUrl();

    if (tokenFromUrl) {
      if (isValidImpersonationToken(tokenFromUrl)) {
        setToken(tokenFromUrl, 'url');
      } else {
        exit('invalid', 'Передан некорректный impersonation токен', 'error');
      }

      stripImpersonationTokenFromUrl();
      return;
    }

    hydrateFromStorage();
  }, [exit, hydrateFromStorage, setToken]);

  return (
    <>
      <ImpersonationBanner />
      <ImpersonationSystemMessage />
      {children}
    </>
  );
}
