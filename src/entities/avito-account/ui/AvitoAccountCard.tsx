import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card';
import { DeleteAccountButton } from '@/features/delete-avito-account';
import type { AvitoAccount } from '../model/types';

interface AvitoAccountCardProps {
  account: AvitoAccount;
  onDeleteSuccess: () => void;
}

export function AvitoAccountCard({ account, onDeleteSuccess }: AvitoAccountCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{account.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {account.companyUserId}
            </p>
          </div>
          <DeleteAccountButton account={account} onSuccess={onDeleteSuccess} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Добавлен: {formatDate(account.createdAt)}</p>
          {account.scope && (
            <p className="mt-1 text-xs">
              Права: {account.scope.split(',').join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

