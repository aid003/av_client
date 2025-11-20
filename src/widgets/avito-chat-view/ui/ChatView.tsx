'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { getMessages } from '@/shared/lib/api';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ItemInfoCard } from './ItemInfoCard';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import type { Chat, Message } from '@/entities/avito-chat';

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatView({ chat, onBack, showBackButton = false }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const messages = await getMessages(chat.id);
      setMessages(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке сообщений');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chat.id) {
      loadMessages();
    }
  }, [chat.id]);

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Заголовок чата */}
      <ChatHeader chat={chat} onBack={onBack} showBackButton={showBackButton} />

      {/* Карточка товара (для u2i чатов) */}
      {chat.chatType === 'u2i' && itemInfo && (
        <div className="px-4 py-3 border-b">
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
      <ScrollArea className="flex-1">
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
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
