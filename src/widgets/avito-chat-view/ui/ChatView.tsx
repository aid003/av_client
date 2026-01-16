'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { AlertCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import {
  useMessagesForChat,
  useMessagesLoading,
  useMessagesError,
  useMessagesActions,
  useChatsActions,
  enableChatScript,
  type Chat,
} from '@/entities/avito-chat';
import { getLeadByChatId, type Lead } from '@/entities/lead';
import { LeadChatCard } from '@/widgets/lead-chat-card';
import { usePolling } from '@/shared/lib/use-polling';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ItemInfoCard } from './ItemInfoCard';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Button } from '@/shared/ui/components/ui/button';

interface ChatViewProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

// Интервал обновления сообщений в миллисекундах (15 секунд)
const MESSAGES_POLLING_INTERVAL = 15000;

export function ChatView({
  chat,
  onBack,
  showBackButton = false,
}: ChatViewProps) {
  const messages = useMessagesForChat(chat.id);
  const isLoading = useMessagesLoading(chat.id);
  const error = useMessagesError(chat.id);
  const { loadMessages, refreshMessages } = useMessagesActions();
  const { refreshChats } = useChatsActions();
  const { authData } = useTelegramAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatLead, setChatLead] = useState<Lead | null>(null);
  const [isScriptDisabled, setIsScriptDisabled] = useState(
    !!chat.scriptDisabledByManager
  );
  const [scriptDisabledAt, setScriptDisabledAt] = useState<string | null>(
    chat.scriptDisabledAt ?? null
  );
  const [isEnablingScript, setIsEnablingScript] = useState(false);
  const [scriptEnableError, setScriptEnableError] = useState<string | null>(null);

  const tenantId = authData?.tenant.id;

  // Загрузка сообщений при монтировании или изменении chat.id
  useEffect(() => {
    if (chat.id) {
      loadMessages(chat.id);
    }
  }, [chat.id, loadMessages]);

  // Load lead by chat
  useEffect(() => {
    async function loadChatLead() {
      if (chat.chatId && tenantId) {
        const lead = await getLeadByChatId(tenantId, chat.chatId);
        setChatLead(lead);
      }
    }
    loadChatLead();
  }, [chat.chatId, tenantId]);

  useEffect(() => {
    setIsScriptDisabled(!!chat.scriptDisabledByManager);
    setScriptDisabledAt(chat.scriptDisabledAt ?? null);
    setScriptEnableError(null);
  }, [chat.id, chat.scriptDisabledByManager, chat.scriptDisabledAt]);

  // Polling для автоматического обновления сообщений
  usePolling(
    () => refreshMessages(chat.id),
    {
      interval: MESSAGES_POLLING_INTERVAL,
      refreshOnFocus: true,
      enabled: !!chat.id && !isLoading,
    }
  );

  // Автоскролл вниз при загрузке сообщений
  useEffect(() => {
    if (!isLoading && messages.length > 0 && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  // Получаем информацию о товаре из context
  const itemInfo = chat.context?.type === 'item' ? chat.context.value : null;

  const formattedDisabledAt = useMemo(() => {
    if (!scriptDisabledAt) return null;
    const date = new Date(scriptDisabledAt);
    if (Number.isNaN(date.getTime())) return null;
    try {
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [scriptDisabledAt]);

  const handleEnableScript = async () => {
    if (!tenantId) return;
    setScriptEnableError(null);
    setIsEnablingScript(true);
    try {
      await enableChatScript(chat.id, tenantId);
      setIsScriptDisabled(false);
      setScriptDisabledAt(null);
      refreshChats(tenantId);
    } catch (err) {
      setScriptEnableError(
        err instanceof Error ? err.message : 'Не удалось включить ИИ-скрипт'
      );
    } finally {
      setIsEnablingScript(false);
    }
  };

  // Определяем authorId текущего пользователя (владельца аккаунта)
  const currentUserAuthorId = useMemo(() => {
    // Ищем сообщение где authorId совпадает с userId
    const ownerMessage = messages.find(
      (m) => m.authorId === m.userId && m.userId
    );

    if (ownerMessage) {
      return ownerMessage.authorId;
    }

    // Fallback: пытаемся найти по участникам чата
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
    <div className="flex flex-col h-full bg-background min-h-0 overflow-x-hidden">
      {/* Заголовок чата */}
      <ChatHeader
        chat={chat}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {isScriptDisabled && (
        <div className="px-4 py-3 border-b shrink-0">
          <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 min-w-0">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    ИИ-скрипт отключен менеджером
                  </div>
                  <div className="text-xs text-amber-800/80 dark:text-amber-200/80">
                    {formattedDisabledAt
                      ? `Отключен ${formattedDisabledAt}`
                      : 'Чтобы продолжить, включите скрипт вручную'}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnableScript}
                disabled={isEnablingScript || !tenantId}
                className="border-amber-300/80 text-amber-900 hover:bg-amber-100 dark:border-amber-700/70 dark:text-amber-100 dark:hover:bg-amber-900/40"
              >
                {isEnablingScript ? 'Возвращаем…' : 'Вернуть ИИ'}
              </Button>
            </div>
            {scriptEnableError && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-300">
                {scriptEnableError}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Карточка лида */}
      {chatLead && (
        <div className="px-4 py-3 border-b shrink-0">
          <LeadChatCard lead={chatLead} />
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
                    <h3 className="text-lg font-semibold mb-2">
                      Ошибка загрузки
                    </h3>
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
                    <h3 className="text-lg font-semibold mb-2">
                      Нет сообщений
                    </h3>
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
