"use client";

import { useSelectedConversation } from "@/features/select-conversation";
import { MessageList } from "@/entities/message";
import { Button } from "@/shared/ui/components/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MessageInput } from "@/features/send-message";
import { MarkAsReadButton } from "@/features/mark-messages-read";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import { useChatMessages } from "../model";
import { EmptyChatView } from "./EmptyChatView";
import { ChatHeader } from "./ChatHeader";
import { MessagesLoader } from "./MessagesLoader";

export function ChatView() {
  const { selectedId } = useSelectedConversation();
  const { authData } = useTelegramAuth();
  const {
    messages,
    conversation,
    hasMore,
    loading,
    error,
    loadMore,
    refetch,
    refetchConversation,
  } = useChatMessages(selectedId);

  if (!selectedId) {
    return <EmptyChatView />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-full overflow-x-hidden max-w-full">
        {conversation && <ChatHeader conversation={conversation} />}
        <div className="p-4 overflow-x-hidden">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full overflow-x-hidden max-w-full">
        {conversation && <ChatHeader conversation={conversation} />}
        <MessagesLoader />
      </div>
    );
  }

  const handleMarkAsRead = () => {
    refetch();
    refetchConversation();
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden max-w-full">
      {conversation && <ChatHeader conversation={conversation} />}

      {hasMore && (
        <div className="p-2 flex justify-center border-b shrink-0">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="ghost"
            size="sm"
          >
            {loading ? "Загрузка..." : "Загрузить предыдущие"}
          </Button>
        </div>
      )}

      <MessageList
        messages={messages}
        userName={conversation?.user.name}
        tenantId={authData?.tenant?.id}
        accountId={conversation?.account?.id}
        chatId={conversation?.chatId}
        onMessageDelete={refetch}
      />

      {conversation && authData?.tenant?.id && conversation.unreadCount > 0 && (
        <div className="p-2 flex justify-center border-t shrink-0">
          <MarkAsReadButton
            tenantId={authData.tenant.id}
            conversationId={conversation.id}
            unreadCount={conversation.unreadCount}
            onSuccess={handleMarkAsRead}
          />
        </div>
      )}

      {conversation && authData?.tenant?.id && conversation.account?.id && (
        <div className="shrink-0">
          <MessageInput
            tenantId={authData.tenant.id}
            accountId={conversation.account.id}
            chatId={conversation.chatId}
            onMessageSent={refetch}
          />
        </div>
      )}
    </div>
  );
}

