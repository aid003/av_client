'use client';

import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { AvitoAdsTable } from '@/widgets/avito-ads-table';

export default function AdsPage() {
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
      <AvitoAdsTable tenantId={authData.tenant.id} />
    </div>
  );
}
