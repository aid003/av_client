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
      className="sticky top-0 z-[1100] w-full border-b border-amber-300 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 text-amber-900 shadow-sm backdrop-blur"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 md:items-center">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600 md:mt-0" />
          <div className="space-y-1">
            <div className="text-sm font-semibold leading-none">Режим impersonation активен</div>
            <p className="text-xs text-amber-800 md:text-sm">
              Все действия выполняются от имени целевого пользователя. Проверьте изменения перед
              сохранением.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <span className="inline-flex items-center justify-center rounded-full bg-amber-200/80 px-3 py-1 text-xs font-medium text-amber-900 shadow-xs md:text-sm">
            Токен хранится в этой вкладке
          </span>
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
