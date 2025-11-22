'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { AvitoAccountsList } from '@/widgets/avito-accounts-list';
import { useAvitoAccountsStore } from '@/entities/avito-account';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';

export default function AvitoPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { loadAccounts } = useAvitoAccountsStore();

  useEffect(() => {
    // Проверяем, вернулся ли пользователь после успешной авторизации
    // Бэкенд перенаправляет на returnUrl с параметром startapp=success
    const startapp = searchParams.get('startapp');
    if (startapp === 'success' && authData?.tenant?.id) {
      setShowSuccessMessage(true);
      // Перезагружаем аккаунты из стора
      loadAccounts(authData.tenant.id);
      // Очищаем URL параметры
      window.history.replaceState({}, '', '/avito');
      // Скрываем сообщение через 5 секунд
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [searchParams, authData, loadAccounts]);

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
      {showSuccessMessage && (
        <div className="mb-6">
          <Alert
            variant="default"
            className="border-green-500 bg-green-50 dark:bg-green-900/20"
          >
            <AlertDescription>
              Аккаунт успешно добавлен!
            </AlertDescription>
          </Alert>
        </div>
      )}

      <AvitoAccountsList tenantId={authData.tenant.id} />
    </div>
  );
}
