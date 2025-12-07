'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { getAuthorizeUrl } from '@/entities/avito-account';

interface AddAccountButtonProps {
  tenantId: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AddAccountButton({
  tenantId,
  variant = 'default',
  size = 'default',
  className,
}: AddAccountButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountLabel, setAccountLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setAccountLabel('');
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setIsDialogOpen(false);
      setAccountLabel('');
      setError(null);
    }
  };

  const handleAddAccount = async () => {
    if (!accountLabel.trim()) {
      setError('Пожалуйста, введите название аккаунта');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Формируем URL для возврата в мини-приложение Telegram
      const returnUrl = 'https://t.me/av_client_bot?startapp=success';
      const scopes =
        'items:info,job:applications,job:cv,messenger:read,messenger:write,stats:read,user:read';

      const response = await getAuthorizeUrl({
        tenantId,
        scopes,
        returnUrl,
        label: accountLabel.trim(),
      });

      // Закрываем модальное окно
      setIsDialogOpen(false);
      setAccountLabel('');

      // Открываем ссылку в системном браузере (_blank), чтобы не использовать встроенный браузер Telegram
      if (typeof window !== 'undefined') {
        try {
          const opened = window.open(response.authorizationUrl, '_blank', 'noopener,noreferrer');

          if (!opened && process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn(
              'Не удалось открыть окно авторизации (возможно, блокировка всплывающих окон).'
            );
          }
        } catch (openError) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Ошибка открытия ссылки авторизации', openError);
          }
        } finally {
          // Закрываем мини-приложение: дальнейшая работа происходит вне WebApp
          try {
            window.Telegram?.WebApp?.close();
          } catch (closeError) {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.warn('Не удалось закрыть мини-приложение', closeError);
            }
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка при получении ссылки авторизации'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        <Plus className="h-4 w-4 mr-2" />
        Добавить аккаунт
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить аккаунт Avito</DialogTitle>
            <DialogDescription>
              Введите название для нового аккаунта. Это поможет вам легко
              идентифицировать его в списке.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account-label">Название аккаунта</Label>
              <Input
                id="account-label"
                placeholder="Например: Основной аккаунт"
                value={accountLabel}
                onChange={(e) => setAccountLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && accountLabel.trim()) {
                    handleAddAccount();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button onClick={handleAddAccount} disabled={isLoading || !accountLabel.trim()}>
              {isLoading ? 'Загрузка...' : 'Продолжить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

