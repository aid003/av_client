'use client';

import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { NotificationsList } from '@/widgets/notifications-list';

export default function NotificationsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Уведомления</h1>
      </div>

      <NotificationsList tenantId={authData.tenant.id} />
    </div>
  );
}
