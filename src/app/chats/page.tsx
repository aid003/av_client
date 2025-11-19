'use client';

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/shared/hooks/useTelegramAuth';
import { AvitoChatsList } from '@/widgets/avito-chats-list';
import { ChatView } from '@/widgets/avito-chat-view';
import { Sheet, SheetContent } from '@/shared/ui/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import type { Chat } from '@/entities/avito-chat';

export default function ChatsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const isMobile = useIsMobile();

  const handleChatSelect = (chat: Chat) => {
    setSelectedChatId(chat.id);
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChatId(null);
    setSelectedChat(null);
  };

  useEffect(() => {
    // Сброс выбранного чата при размонтировании
    return () => {
      setSelectedChatId(null);
      setSelectedChat(null);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  const tenantId = authData.tenant.id;

  // Мобильная версия: список или Sheet с чатом
  if (isMobile) {
    return (
      <>
        <div className="h-screen flex flex-col">
          {!selectedChatId && (
            <div className="flex-1 overflow-auto p-4">
              <AvitoChatsList
                tenantId={tenantId}
                onChatSelect={handleChatSelect}
                selectedChatId={selectedChatId || undefined}
              />
            </div>
          )}
        </div>
        <Sheet open={!!selectedChatId} onOpenChange={(open) => !open && handleCloseChat()}>
          <SheetContent side="right" className="w-full sm:w-full p-0">
            {selectedChat && (
              <ChatView
                chat={selectedChat}
                onBack={handleCloseChat}
                showBackButton={true}
              />
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Десктопная версия: двухпанельный layout
  return (
    <div className="h-screen flex">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r overflow-auto p-4">
        <AvitoChatsList
          tenantId={tenantId}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId || undefined}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {selectedChat ? (
          <ChatView chat={selectedChat} />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Выберите чат
              </h2>
              <p className="text-muted-foreground">
                Выберите чат из списка слева, чтобы начать просмотр сообщений
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

