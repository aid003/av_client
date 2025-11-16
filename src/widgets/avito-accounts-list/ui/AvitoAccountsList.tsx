'use client';

import { useEffect, useState } from 'react';
import { AvitoAccountCard, type AvitoAccount } from '@/entities/avito-account';
import { AddAccountButton } from '@/features/add-avito-account';
import { getAvitoAccounts } from '@/shared/lib/api';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card';

interface AvitoAccountsListProps {
  tenantId: string;
  onAccountChange?: () => void;
}

export function AvitoAccountsList({
  tenantId,
  onAccountChange,
}: AvitoAccountsListProps) {
  const [accounts, setAccounts] = useState<AvitoAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAvitoAccounts(tenantId);
      setAccounts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке аккаунтов'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [tenantId]);

  const handleAccountDeleted = () => {
    loadAccounts();
    onAccountChange?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <AddAccountButton tenantId={tenantId} />
        </div>
      </div>
    );
  }

  // Если аккаунтов нет - показываем заглушку с заголовком и описанием
  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Аккаунты Avito</h1>
          <p className="text-muted-foreground">
            Управление вашими аккаунтами Avito для работы с API
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  У вас пока нет аккаунтов Avito
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Добавьте свой первый аккаунт, чтобы начать работу с Avito API
                </p>
              </div>
              <AddAccountButton tenantId={tenantId} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Если есть аккаунты - показываем список
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Мои аккаунты Avito</h2>
        <AddAccountButton tenantId={tenantId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AvitoAccountCard
            key={account.id}
            account={account}
            onDeleteSuccess={handleAccountDeleted}
          />
        ))}
      </div>
    </div>
  );
}

