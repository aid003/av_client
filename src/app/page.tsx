'use client';

import Image from "next/image";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";

export default function Home() {
  const { authData, isLoading } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Добро пожаловать{authData?.user.first_name ? `, ${authData.user.first_name}` : ''}!
          </h1>
          {authData && (
            <div className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              <p className="mb-4">
                Вы успешно авторизованы через Telegram
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Тенант:</strong> {authData.tenant.name}</p>
                <p><strong>ID:</strong> {authData.user.id}</p>
                {authData.user.username && (
                  <p><strong>Username:</strong> @{authData.user.username}</p>
                )}
              </div>
            </div>
          )}
          {!authData && (
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Откройте приложение через Telegram Mini App для авторизации.
          </p>
          )}
        </div>
      </main>
    </div>
  );
}
