'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import {
  deleteAvitoAccount,
  useAvitoAccountsStore,
  type AvitoAccount,
} from '@/entities/avito-account';

interface DeleteAccountButtonProps {
  account: AvitoAccount;
  onSuccess: () => void;
}

export function DeleteAccountButton({
  account,
  onSuccess,
}: DeleteAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { removeAccount } = useAvitoAccountsStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteAvitoAccount(account.id);
      removeAccount(account.tenantId, account.id);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-700 transition-colors"
        aria-label="Удалить аккаунт"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Удалить аккаунт?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <div>
                  Вы уверены, что хотите удалить аккаунт{' '}
                  <strong>{account.label}</strong>?
                </div>
                <div className="text-sm">
                  ID аккаунта: <strong>{account.companyUserId}</strong>
                </div>
                <div className="text-red-600 font-medium">
                  Это действие необратимо. Вам потребуется повторно авторизоваться
                  через Avito, чтобы добавить этот аккаунт снова.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

