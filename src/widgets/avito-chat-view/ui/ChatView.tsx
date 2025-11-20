'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { useChatsStore } from '@/shared/lib/store';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ItemInfoCard } from './ItemInfoCard';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import type { Chat } from '@/entities/avito-chat';

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Интервал обновления сообщений в миллисекундах (15 секунд)
const MESSAGES_POLLING_INTERVAL = 15000;

export function ChatView({ chat, onBack, showBackButton = false }: ChatViewProps) {
  const {
    messagesByChat,
    loadingMessagesByChat,
    errorsMessagesByChat,
    loadMessages,
    refreshMessages,
  } = useChatsStore();

  const messages = messagesByChat[chat.id] || [];
  const isLoading = loadingMessagesByChat[chat.id] ?? true;
  const error = errorsMessagesByChat[chat.id] || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка сообщений при монтировании
  useEffect(() => {
    if (chat.id) {
      loadMessages(chat.id);
    }
  }, [chat.id, loadMessages]);

  // Polling для автоматического обновления сообщений
  useEffect(() => {
    if (!chat.id) return;

    // Очищаем предыдущий интервал
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Устанавливаем новый интервал
    pollingIntervalRef.current = setInterval(() => {
      refreshMessages(chat.id);
    }, MESSAGES_POLLING_INTERVAL);

    // Очистка при размонтировании
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [chat.id, refreshMessages]);

  // Обновление при фокусе страницы
  useEffect(() => {
    if (!chat.id) return;

    const handleFocus = () => {
      refreshMessages(chat.id);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [chat.id, refreshMessages]);

  useEffect(() => {
    // Автоскролл вниз при загрузке сообщений
    if (!isLoading && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  // Получаем информацию о товаре из context
  const itemInfo = chat.context?.type === 'item' ? chat.context.value : null;

  // Определяем authorId текущего пользователя (владельца аккаунта)
  // Логика: если authorId === userId в сообщении, то это сообщение от владельца аккаунта
  const currentUserAuthorId = useMemo(() => {
    // Ищем сообщение где authorId совпадает с userId
    // Это означает, что сообщение от владельца аккаунта (продавца)
    const ownerMessage = messages.find(
      (m) => m.authorId === m.userId && m.userId
    );
    
    if (ownerMessage) {
      return ownerMessage.authorId;
    }
    
    // Fallback: пытаемся найти по участникам чата
    // avitoAccountId может быть связан с participant.id
    const accountParticipant = chat.participants.find(
      (p) => p.id.toString() === chat.avitoAccountId
    );
    
    if (accountParticipant) {
      return accountParticipant.id.toString();
    }
    
    // Последний fallback: используем isOutgoing если есть
    const outgoingMessage = messages.find((m) => m.isOutgoing);
    return outgoingMessage?.authorId;
  }, [chat.participants, chat.avitoAccountId, messages]);

  return (
    <div className="flex flex-col h-full bg-background min-h-0">
      {/* Заголовок чата */}
      <ChatHeader chat={chat} onBack={onBack} showBackButton={showBackButton} />

      {/* Карточка товара (для u2i чатов) */}
      {chat.chatType === 'u2i' && itemInfo && (
        <div className="px-4 py-3 border-b shrink-0">
          <ItemInfoCard
            title={itemInfo.title}
            price_string={itemInfo.price_string}
            images={itemInfo.images}
            location={itemInfo.location}
            url={itemInfo.url}
          />
        </div>
      )}

      {/* Область сообщений */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {isLoading ? (
            // Скелетоны загрузки
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <Skeleton className="h-16 w-3/4 max-w-md rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Ошибка загрузки
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 pb-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ошибка загрузки</h3>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : messages.length === 0 ? (
            // Пустой чат
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 pb-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Нет сообщений</h3>
                    <p className="text-sm text-muted-foreground">
                      Сообщения в этом чате появятся здесь
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Сообщения
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  currentAuthorId={currentUserAuthorId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
