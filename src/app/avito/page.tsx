'use client';

import { useTelegramAuth } from '@/shared/hooks/useTelegramAuth';

export default function AvitoPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Аккаунты</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Информация о пользователе</h2>
          <div className="space-y-2">
            <p><strong>Имя:</strong> {authData.user.firstName} {authData.user.lastName || ''}</p>
            <p><strong>Telegram ID:</strong> {authData.user.telegramId}</p>
            {authData.user.username && <p><strong>Username:</strong> @{authData.user.username}</p>}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">Информация о тенанте</h2>
          <div className="space-y-2">
            <p><strong>ID тенанта:</strong> {authData.tenant.id}</p>
            <p><strong>Название:</strong> {authData.tenant.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
