'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import {
  getWebhookStatus,
  registerWebhook,
  unsubscribeWebhook,
  type AvitoAccount,
} from '@/entities/avito-account';

interface WebhookSubscriptionButtonProps {
  account: AvitoAccount;
}

export function WebhookSubscriptionButton({
  account,
}: WebhookSubscriptionButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getWebhookStatus(account.id);
        setIsSubscribed(status !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки статуса');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [account.id]);

  const handleToggle = async () => {
    setIsToggling(true);
    setError(null);

    try {
      if (isSubscribed) {
        await unsubscribeWebhook(account.id);
        setIsSubscribed(false);
      } else {
        await registerWebhook(account.id);
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Button variant="outline" size="sm" disabled className="w-full">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Загрузка...
        </Button>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant={isSubscribed ? 'outline' : 'default'}
        size="sm"
        onClick={handleToggle}
        disabled={isToggling}
        className="w-full"
      >
        {isToggling ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {isSubscribed ? 'Отписка...' : 'Подписка...'}
          </>
        ) : isSubscribed ? (
          <>
            <BellOff className="h-4 w-4 mr-2" />
            Отписаться от рассылки
          </>
        ) : (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Получать сообщения
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
