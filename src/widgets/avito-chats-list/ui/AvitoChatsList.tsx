'use client';

import { useEffect, memo } from 'react';
import { MessageSquare } from 'lucide-react';
import {
  ChatListItem,
  useChatsForTenant,
  useChatsLoading,
  useChatsError,
  useChatsActions,
  type Chat,
} from '@/entities/avito-chat';
import { usePolling } from '@/shared/lib/use-polling';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { EmptyState } from '@/shared/ui';

interface AvitoChatsListProps {
  tenantId: string;
  onChatSelect?: (chat: Chat) => void;
  selectedChatId?: string;
}

// Интервал обновления в миллисекундах (15 секунд)
const POLLING_INTERVAL = 15000;

// Мемоизированный элемент чата
const MemoizedChatItem = memo<{
  chat: Chat;
  onClick: () => void;
  isSelected: boolean;
}>(({ chat, onClick, isSelected }) => (
  <div className={isSelected ? 'ring-2 ring-primary rounded-xl' : ''}>
    <ChatListItem chat={chat} onClick={onClick} />
  </div>
));

export function AvitoChatsList({
  tenantId,
  onChatSelect,
  selectedChatId,
}: AvitoChatsListProps) {
  const chats = useChatsForTenant(tenantId);
  const isLoading = useChatsLoading(tenantId);
  const error = useChatsError(tenantId);
  const { loadChats, refreshChats } = useChatsActions();

  // Загрузка чатов при монтировании
  useEffect(() => {
    loadChats(tenantId);
  }, [tenantId, loadChats]);

  // Polling для автоматического обновления
  usePolling(
    () => refreshChats(tenantId),
    {
      interval: POLLING_INTERVAL,
      refreshOnFocus: true,
      enabled: !isLoading,
    }
  );

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
          <p className="text-muted-foreground">
            Сообщения от покупателей на Avito
          </p>
        </div>

        <EmptyState
          icon={<MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          title="Нет чатов"
          description="Когда покупатели начнут писать вам, чаты появятся здесь"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Чаты</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Показано {chats.length}{' '}
          {chats.length === 1
            ? 'чат'
            : chats.length < 5
              ? 'чата'
              : 'чатов'}
        </p>
      </div>

      <div className="flex flex-col gap-2 max-w-2xl">
        {chats.map((chat) => (
          <MemoizedChatItem
            key={chat.id}
            chat={chat}
            onClick={() => onChatSelect?.(chat)}
            isSelected={selectedChatId === chat.id}
          />
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
