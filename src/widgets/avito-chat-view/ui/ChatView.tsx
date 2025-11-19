'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Package } from 'lucide-react';
import { getMessages } from '@/shared/lib/api';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Button } from '@/shared/ui/components/ui/button';
import { Badge } from '@/shared/ui/components/ui/badge';
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMessages(chat.id);
      setMessages(response.data || []);
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
    if (!isLoading && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isLoading]);

  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chat={chat} onBack={onBack} showBackButton={showBackButton} />

      {chat.type === 'u2i' && chat.item && (
        <div className="p-4 border-b bg-muted/20">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {chat.item.imageUrl && (
                  <div className="relative w-24 h-24 shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={chat.item.imageUrl}
                      alt={chat.item.title || 'Товар'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {chat.item.title}
                    </h3>
                    {chat.item.price && (
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(chat.item.price)}
                      </p>
                    )}
                  </div>
                  {chat.item.status && (
                    <Badge variant="secondary" className="text-xs">
                      {chat.item.status}
                    </Badge>
                  )}
                  {chat.item.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={chat.item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Открыть на Avito
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-1">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-2">
                  <Skeleton className="h-16 w-3/4 rounded-lg" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 pb-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

