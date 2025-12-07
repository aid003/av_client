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
import { ApiError } from '@/shared/api';

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
    if (isDeleting) {
      return; // защита от двойного клика/двойного вызова
    }
    setIsDeleting(true);
    setError(null);

    let hasError = false;

    try {
      await deleteAvitoAccount(account.id);
      removeAccount(account.tenantId, account.id);
    } catch (err) {
      let message = 'Ошибка при удалении';

      // Показываем ошибку только если backend вернул 404 (аккаунт не найден)
      if (err instanceof ApiError && err.status === 404) {
          hasError = true;
        message =
          err.message && err.message !== 'The string did not match the expected pattern.'
            ? err.message
            : 'Аккаунт не найден. Возможно, он уже был удалён.';
      } else if (err instanceof Error) {
        hasError = true;
        // Для прочих статусов/ошибок показываем общее сообщение
        message =
          err.message === 'The string did not match the expected pattern.'
            ? 'Ошибка при удалении аккаунта Avito. Попробуйте позже.'
            : err.message;
      }

      setError(message);
    } finally {
      setIsDeleting(false);
      // Если не было ошибки (статус 200) — закрываем окно и уведомляем родителя,
      // который перезагрузит список аккаунтов
      if (!hasError) {
        setIsOpen(false);
        onSuccess();
      }
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

