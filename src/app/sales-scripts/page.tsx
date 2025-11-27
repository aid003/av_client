'use client';

import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { SalesScriptsList } from '@/widgets/sales-scripts-list';
import { CreateSalesScriptButton } from '@/features/create-sales-script';
import { useSalesScriptsForTenant } from '@/entities/sales-script';

export default function SalesScriptsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const salesScripts = authData
    ? useSalesScriptsForTenant(authData.tenant.id)
    : [];

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
        <h1 className="text-3xl font-bold">Скрипты продаж</h1>
        {salesScripts.length > 0 && (
          <CreateSalesScriptButton tenantId={authData.tenant.id} />
        )}
      </div>

      <SalesScriptsList tenantId={authData.tenant.id} />
    </div>
  );
}
