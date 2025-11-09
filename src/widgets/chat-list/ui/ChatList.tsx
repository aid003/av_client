"use client";

import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { Button } from "@/shared/ui/components/ui/button";
import { useFilters } from "@/features/conversation-filters";
import { useSelectedConversation } from "@/features/select-conversation";
import { useConversations } from "../model";
import { ChatListHeader } from "./ChatListHeader";
import { ConversationItem } from "./ConversationItem";
import { ChatListLoader } from "./ChatListLoader";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ChatList() {
  const { filters, updateFilter } = useFilters();
  const { selectedId, setSelectedId } = useSelectedConversation();
  const { conversations, total, hasMore, loading, error, loadMore } =
    useConversations(filters);

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Диалоги</h2>
        </div>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatListHeader
        filters={filters}
        onSearchChange={(value) => updateFilter("search", value)}
        totalConversations={total}
      />

      <ScrollArea className="flex-1">
        {loading && conversations.length === 0 ? (
          <ChatListLoader />
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            Диалоги не найдены
          </div>
        ) : (
          <>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={selectedId === conversation.id}
                onClick={() => setSelectedId(conversation.id)}
              />
            ))}
            {hasMore && (
              <div className="p-4">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? "Загрузка..." : "Загрузить еще"}
                </Button>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}

