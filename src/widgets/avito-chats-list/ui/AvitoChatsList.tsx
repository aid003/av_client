'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatListItem } from '@/entities/avito-chat';
import { useChatsStore } from '@/shared/lib/store';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import type { Chat } from '@/entities/avito-chat';

interface AvitoChatsListProps {
  tenantId: string;
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

// Интервал обновления в миллисекундах (30 секунд)
const POLLING_INTERVAL = 30000;

export function AvitoChatsList({ tenantId, onChatSelect, selectedChatId }: AvitoChatsListProps) {
  const {
    chatsByTenant,
    loadingByTenant,
    errorsByTenant,
    loadChats,
    refreshChats,
  } = useChatsStore();

  const chats = chatsByTenant[tenantId] || [];
  const isLoading = loadingByTenant[tenantId] ?? true;
  const error = errorsByTenant[tenantId] || null;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка чатов при монтировании
  useEffect(() => {
    loadChats(tenantId);
  }, [tenantId, loadChats]);

  // Polling для автоматического обновления
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Устанавливаем новый интервал
    pollingIntervalRef.current = setInterval(() => {
      refreshChats(tenantId);
    }, POLLING_INTERVAL);

    // Очистка при размонтировании
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [tenantId, refreshChats]);

  // Обновление при фокусе страницы
  useEffect(() => {
    const handleFocus = () => {
      refreshChats(tenantId);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [tenantId, refreshChats]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-2 max-w-2xl">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && chats.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Чаты</h2>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Чаты</h1>
          <p className="text-muted-foreground">Сообщения от покупателей на Avito</p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Нет чатов</h3>
                <p className="text-sm text-muted-foreground">
                  Когда покупатели начнут писать вам, чаты появятся здесь
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Чаты</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Показано {chats.length} {chats.length === 1 ? 'чат' : chats.length < 5 ? 'чата' : 'чатов'}
        </p>
      </div>

      <div className="flex flex-col gap-2 max-w-2xl">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={selectedChatId === chat.id ? 'ring-2 ring-primary rounded-xl' : ''}
          >
            <ChatListItem
              chat={chat}
              onClick={() => onChatSelect?.(chat)}
            />
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

