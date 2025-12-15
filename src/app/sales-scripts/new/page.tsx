'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { useSidebar } from '@/shared/ui/components/ui/sidebar';
import { ScriptEditor } from '@/widgets/script-editor';

interface NewScriptData {
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
}

export default function NewScriptPage() {
  const router = useRouter();
  const { authData, isLoading: isAuthLoading, isAuthenticated } = useTelegramAuth();

  const [newScriptData, setNewScriptData] = useState<NewScriptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { open, setOpen } = useSidebar();
  const hasClosedSidebarRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !authData) {
      router.push('/sales-scripts');
      return;
    }

    // Загружаем данные нового скрипта из localStorage
    try {
      const storedData = localStorage.getItem('newScriptData');
      if (!storedData) {
        setError('Данные нового скрипта не найдены');
        return;
      }

      const parsedData: NewScriptData = JSON.parse(storedData);

      // Проверяем, что tenantId совпадает
      if (parsedData.tenantId !== authData.tenant.id) {
        setError('Несоответствие tenantId');
        localStorage.removeItem('newScriptData');
        router.push('/sales-scripts');
        return;
      }

      setNewScriptData(parsedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке данных скрипта'
      );
      localStorage.removeItem('newScriptData');
    }
  }, [authData, isAuthenticated, isAuthLoading, router]);

  // Автоматическое сворачивание sidebar при открытии редактора
  useEffect(() => {
    if (!hasClosedSidebarRef.current && open) {
      setOpen(false);
      hasClosedSidebarRef.current = true;
    }

    return () => {
      hasClosedSidebarRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Запускаем только при монтировании

  if (isAuthLoading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={() => router.push('/sales-scripts')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Вернуться к списку скриптов
          </button>
        </div>
      </div>
    );
  }

  if (!newScriptData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <ScriptEditor
      script={null}
      tenantId={authData.tenant.id}
      newScriptData={newScriptData}
      isLoading={false}
      error={null}
    />
  );
}

