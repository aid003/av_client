'use client';

import { useState, useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { AvitoChatsList } from '@/widgets/avito-chats-list';
import { ChatView } from '@/widgets/avito-chat-view';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useSidebar } from '@/shared/ui/components/ui/sidebar';
import type { Chat } from '@/entities/avito-chat';

export default function ChatsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const isMobile = useIsMobile();
  const { open, setOpen } = useSidebar();
  const hasClosedSidebarRef = useRef(false);

  const tenantId = authData?.tenant.id;

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  // Закрываем сайдбар только один раз при монтировании
  useEffect(() => {
    if (!hasClosedSidebarRef.current && open) {
      setOpen(false);
      hasClosedSidebarRef.current = true;
    }

    // Сброс выбранного чата при размонтировании
    return () => {
      setSelectedChat(null);
      hasClosedSidebarRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Запускаем только при монтировании

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

  // Мобильная версия: список или Sheet с чатом
  if (isMobile) {
    return (
      <>
        <div className="h-[calc(var(--app-dvh,100dvh)-3rem)] flex flex-col overflow-hidden overflow-x-hidden">
          {!selectedChat && (
            <div className="flex-1 overflow-y-auto p-4">
              <AvitoChatsList
                tenantId={tenantId!}
                onChatSelect={handleChatSelect}
                selectedChatId={undefined}
              />
            </div>
          )}
        </div>
        <Sheet open={!!selectedChat} onOpenChange={(open) => !open && handleCloseChat()}>
          <SheetContent side="right" className="w-full sm:w-full p-0 flex flex-col gap-0 h-full overflow-x-hidden">
            <SheetTitle className="sr-only">Чат</SheetTitle>
            {selectedChat && (
              <div className="flex-1 flex flex-col min-h-0">
                <ChatView
                  chat={selectedChat}
                  onBack={handleCloseChat}
                  showBackButton={true}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Десктопная версия: двухпанельный layout
  return (
    <div className="h-[calc(var(--app-dvh,100dvh)-max(2rem,calc(env(safe-area-inset-top,0px)+0.5rem)))] md:h-[calc(var(--app-dvh,100dvh)-3rem)] flex overflow-hidden overflow-x-hidden">
      {/* Левая панель со списком чатов */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <AvitoChatsList
            tenantId={tenantId!}
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>
      </div>

      {/* Правая панель с просмотром чата */}
      <div className="flex-1 flex flex-col overflow-hidden overflow-x-hidden">
        {selectedChat ? (
          <ChatView chat={selectedChat} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
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

