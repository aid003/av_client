'use client';

import { Power, ShieldAlert } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/shared/ui/components/ui/button';
import { useImpersonationStore } from '@/shared/lib/impersonation-store';

export function ImpersonationBanner() {
  const isActive = useImpersonationStore((state) => state.isActive);
  const exit = useImpersonationStore((state) => state.exit);

  const handleExit = useCallback(() => {
    exit('manual', 'Режим impersonation завершен', 'info');

    // Обновляем интерфейс, чтобы переключиться на контекст реального пользователя
    if (typeof window !== 'undefined') {
      window.setTimeout(() => window.location.reload(), 150);
    }
  }, [exit]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-[1100] w-full border-b border-amber-300/60 bg-gradient-to-r from-amber-50/70 via-amber-100/70 to-amber-50/70 text-amber-900 shadow-sm backdrop-blur"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2 md:items-center">
          <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-600 md:mt-0" />
          <div>
            <div className="text-sm font-semibold leading-none">Режим impersonation активен</div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-900 hover:bg-amber-200/70"
            onClick={handleExit}
          >
            <Power className="h-4 w-4" />
            Выйти из режима
          </Button>
        </div>
      </div>
    </div>
  );
}
