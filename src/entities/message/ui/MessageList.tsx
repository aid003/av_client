"use client";

import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { MessageItem } from "./MessageItem";
import type { Message } from "../model/types";

interface MessageListProps {
  messages: Message[];
  userName?: string;
  tenantId?: string;
  accountId?: string;
  chatId?: string;
  onMessageDelete?: () => void;
}

export function MessageList({
  messages,
  userName,
  tenantId,
  accountId,
  chatId,
  onMessageDelete,
}: MessageListProps) {
  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Нет сообщений
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              userName={userName}
              tenantId={tenantId}
              accountId={accountId}
              chatId={chatId}
              onDelete={onMessageDelete}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}

