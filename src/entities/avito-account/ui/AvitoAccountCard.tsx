import { Calendar, Hash, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { DeleteAccountButton } from '@/features/delete-avito-account';
import { WebhookSubscriptionButton } from '@/features/webhook-subscription';
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
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md p-0 gap-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 border-b bg-muted/30">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold text-lg leading-none tracking-tight">
            {account.label}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            <span className="font-mono">{account.companyUserId}</span>
          </div>
        </div>
        <div className="-mr-1 -mt-1">
          <DeleteAccountButton account={account} onSuccess={onDeleteSuccess} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 p-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Добавлен: {formatDate(account.createdAt)}</span>
        </div>

        {account.scope && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span>Права доступа</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {account.scope.split(',').map((scope) => (
                <Badge
                  key={scope}
                  variant="secondary"
                  className="px-2 py-0.5 text-[10px] font-normal border"
                >
                  {scope.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full pt-4 border-t">
          <WebhookSubscriptionButton account={account} />
        </div>
      </CardFooter>
    </Card>
  );
}

