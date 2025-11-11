"use client";

import { Avatar, AvatarFallback } from "@/shared/ui/components/ui/avatar";
import { Badge } from "@/shared/ui/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Conversation } from "@/entities/conversation";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  const getInitials = (name?: string): string => {
    if (!name) return "??";
    const trimmed = name.trim();
    if (!trimmed) return "??";
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Вчера";
    } else if (days < 7) {
      return `${days} дн.`;
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-3 p-3 cursor-pointer hover:bg-accent transition-colors border-b min-w-0 overflow-x-hidden",
        isActive && "bg-accent"
      )}
    >
      <Avatar className="size-12 shrink-0">
        <AvatarFallback
          className={cn(
            "text-sm",
            conversation.unreadCount > 0
              ? "bg-primary/10 text-primary font-semibold"
              : "bg-muted text-muted-foreground"
          )}
        >
          {getInitials(conversation.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div
            className={cn(
              "font-medium truncate",
              conversation.unreadCount > 0 && "font-semibold"
            )}
          >
            {conversation.user.name || "Без имени"}
          </div>
          {conversation.account?.label && (
            <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
              {conversation.account.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-muted-foreground truncate">
            {conversation.item?.title || "Без объявления"}
          </div>
          <div className="text-xs text-muted-foreground shrink-0">
            {formatTime(conversation.lastSeenAt)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "text-sm truncate",
              conversation.unreadCount > 0
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {conversation.lastMessage?.contentJson?.text || "Нет сообщений"}
          </div>
          {conversation.unreadCount > 0 && (
            <Badge
              variant="default"
              className="shrink-0 size-5 flex items-center justify-center p-0 text-xs"
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

