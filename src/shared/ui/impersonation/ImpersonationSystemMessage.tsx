'use client';

import { useEffect } from 'react';
import { ShieldOff, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/components/ui/alert';
import { Button } from '@/shared/ui/components/ui/button';
import { useImpersonationStore } from '@/shared/lib/impersonation-store';

const TITLES: Record<string, string> = {
  manual: 'Impersonation отключен',
  expired: 'Сессия impersonation истекла',
  forbidden: 'Доступ к impersonation запрещен',
  invalid: 'Некорректный impersonation токен',
  cleared: 'Impersonation остановлен',
};

export function ImpersonationSystemMessage() {
  const statusMessage = useImpersonationStore((state) => state.statusMessage);
  const statusLevel = useImpersonationStore((state) => state.statusLevel);
  const lastEndReason = useImpersonationStore((state) => state.lastEndReason);
  const clearStatus = useImpersonationStore((state) => state.clearStatus);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => clearStatus(), 7000);
    return () => window.clearTimeout(timer);
  }, [clearStatus, statusMessage]);

  if (!statusMessage) {
    return null;
  }

  const isError = statusLevel === 'error';
  const title = lastEndReason ? TITLES[lastEndReason] ?? TITLES.cleared : TITLES.cleared;

  const accentClasses = isError
    ? 'border-red-200 bg-red-50 text-red-900'
    : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div className="fixed left-1/2 top-4 z-[1200] w-[min(720px,95vw)] -translate-x-1/2">
      <Alert className={accentClasses}>
        <ShieldOff className="h-5 w-5" />
        <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
          {title}
        </AlertTitle>
        <AlertDescription className="text-sm text-inherit">
          <div className="flex items-start justify-between gap-3">
            <span className="leading-relaxed">{statusMessage}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-current hover:bg-white/40"
              aria-label="Закрыть уведомление"
              onClick={clearStatus}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
