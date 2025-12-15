'use client';

import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { BroadcastPanel } from '@/widgets/broadcast-panel';
import { Loader2 } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-destructive">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  return <BroadcastPanel />;
}
