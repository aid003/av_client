'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { useSidebar } from '@/shared/ui/components/ui/sidebar';
import { getSalesScript, type SalesScript } from '@/entities/sales-script';
import { ScriptEditor } from '@/widgets/script-editor';

interface EditScriptPageProps {
  params: Promise<{ id: string }>;
}

export default function EditScriptPage({ params }: EditScriptPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { authData, isLoading: isAuthLoading, isAuthenticated } = useTelegramAuth();

  const [script, setScript] = useState<SalesScript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { open, setOpen } = useSidebar();
  const hasClosedSidebarRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !authData) {
      router.push('/sales-scripts');
      return;
    }

    const loadScript = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getSalesScript(id, authData.tenant.id);
        setScript(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Ошибка при загрузке скрипта'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadScript();
  }, [id, authData, isAuthenticated, isAuthLoading, router]);

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

  if (!script && !isLoading && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Скрипт не найден</p>
        </div>
      </div>
    );
  }

  return (
    <ScriptEditor
      script={script!}
      tenantId={authData.tenant.id}
      isLoading={isLoading}
      error={error}
    />
  );
}

