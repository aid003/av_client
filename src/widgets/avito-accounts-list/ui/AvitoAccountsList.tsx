'use client';

import { useEffect, memo } from 'react';
import {
  AvitoAccountCard,
  useAccountsForTenant,
  useAccountsLoading,
  useAccountsError,
  useAccountsActions,
  type AvitoAccount,
} from '@/entities/avito-account';
import { AddAccountButton } from '@/features/add-avito-account';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card';
import { EmptyState, EmptyStateIcons } from '@/shared/ui';

interface AvitoAccountsListProps {
  tenantId: string;
  onAccountChange?: () => void;
}

// Мемоизированная карточка аккаунта
const MemoizedAccountCard = memo<{
  account: AvitoAccount;
  onDeleteSuccess: () => void;
}>(AvitoAccountCard);

export function AvitoAccountsList({
  tenantId,
  onAccountChange,
}: AvitoAccountsListProps) {
  const accounts = useAccountsForTenant(tenantId);
  const isLoading = useAccountsLoading(tenantId);
  const error = useAccountsError(tenantId);
  const { loadAccounts } = useAccountsActions();

  useEffect(() => {
    loadAccounts(tenantId);
  }, [tenantId, loadAccounts]);

  const handleAccountDeleted = () => {
    loadAccounts(tenantId);
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

        <EmptyState
          icon={EmptyStateIcons.Plus}
          title="У вас пока нет аккаунтов Avito"
          description="Добавьте свой первый аккаунт, чтобы начать работу с Avito API"
          action={<AddAccountButton tenantId={tenantId} />}
        />
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
          <MemoizedAccountCard
            key={account.id}
            account={account}
            onDeleteSuccess={handleAccountDeleted}
          />
        ))}
      </div>
    </div>
  );
}

