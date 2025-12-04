'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Label } from '@/shared/ui/components/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Switch } from '@/shared/ui/components/ui/switch';
import {
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { SalesScript } from '@/entities/sales-script';
import { useScriptBindingsActions } from '@/entities/sales-script';
import {
  useAccountsForTenant,
  useAccountsLoading,
  useAccountsActions,
} from '@/entities/avito-account';

interface AttachScriptToAccountDialogProps {
  script: SalesScript | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachScriptToAccountDialog({
  script,
  tenantId,
  open,
  onOpenChange,
}: AttachScriptToAccountDialogProps) {
  const accounts = useAccountsForTenant(tenantId);
  const isLoading = useAccountsLoading(tenantId);
  const { loadAccounts } = useAccountsActions();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { attachToAccount } = useScriptBindingsActions();

  const canSubmit = script && selectedAccountId && !submitting;

  useEffect(() => {
    if (open) {
      // Загружаем аккаунты при открытии диалога
      loadAccounts(tenantId);
      // Reset state when dialog opens
      setSelectedAccountId('');
      setIsActive(true);
      setSubmitting(false);
      setError(null);
      setSuccess(false);
    }
  }, [open, tenantId, loadAccounts]);

  const handleSubmit = async () => {
    if (!script || !selectedAccountId) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await attachToAccount(script.id, tenantId, selectedAccountId, isActive);
      setSuccess(true);
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при привязке к аккаунту'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Привязать к аккаунту</DialogTitle>
          <DialogDescription>
            Скрипт продаж: <span className="font-medium">{script?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="binding-active">Активна</Label>
            <Switch
              id="binding-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Скрипт успешно привязан к аккаунту
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="account-select">Выберите аккаунт</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-2">
                Загрузка аккаунтов...
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                Аккаунты не найдены
              </div>
            ) : (
              <Select
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
              >
                <SelectTrigger id="account-select">
                  <SelectValue placeholder="Выберите аккаунт" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.label || `Аккаунт ${account.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            {submitting ? 'Привязываю...' : 'Привязать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

