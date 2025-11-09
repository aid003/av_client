"use client";

import { Avatar, AvatarFallback } from "@/shared/ui/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { QuoteButton } from "@/features/quote-message";
import { DeleteMessageButton } from "@/features/delete-message";
import { VoicePlayer } from "./VoicePlayer";
import type { Message } from "../model/types";

interface MessageItemProps {
  message: Message;
  userName?: string;
  tenantId?: string;
  accountId?: string;
  chatId?: string;
  onDelete?: () => void;
}

export function MessageItem({
  message,
  userName,
  tenantId,
  accountId,
  chatId,
  onDelete,
}: MessageItemProps) {
  const isIncoming = message.direction === "IN";
  const isDeleted = message.type === "DELETED";
  const isVoice = message.type === "VOICE";
  const canDelete =
    !isIncoming &&
    !isDeleted &&
    tenantId &&
    accountId &&
    chatId &&
    Date.now() - new Date(message.createdAt).getTime() < 3600000; // 1 час

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const words = trimmed.split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmed.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex gap-2 mb-4 max-w-[80%] group",
        isIncoming ? "justify-start" : "justify-end ml-auto"
      )}
    >
      {isIncoming && (
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {/* Цитируемое сообщение */}
        {message.quote && (
          <div
            className={cn(
              "text-xs p-2 rounded-lg border-l-2 bg-muted/50",
              isIncoming ? "border-l-muted-foreground" : "border-l-primary"
            )}
          >
            <div className="text-muted-foreground mb-1">
              {message.quote.type === "TEXT" && message.quote.contentJson?.text
                ? message.quote.contentJson.text.substring(0, 50) +
                  (message.quote.contentJson.text.length > 50 ? "..." : "")
                : "Сообщение"}
            </div>
          </div>
        )}

        {/* Основное сообщение */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 min-w-0",
            isIncoming
              ? "bg-muted text-foreground rounded-tl-none"
              : "bg-primary text-primary-foreground rounded-tr-none",
            isDeleted && "italic opacity-70"
          )}
        >
          {/* Контент сообщения */}
          {isDeleted ? (
            <div className="text-sm">[Сообщение удалено]</div>
          ) : isVoice && message.primaryImageUrl ? (
            <VoicePlayer voiceUrl={message.primaryImageUrl} />
          ) : (
            <div className="text-sm break-words whitespace-pre-wrap">
              {message.contentJson?.text || "[Пустое сообщение]"}
            </div>
          )}

          {/* Время и статус */}
          <div className="flex items-center gap-2 justify-between mt-1">
            <div
              className={cn(
                "text-xs",
                isIncoming
                  ? "text-muted-foreground"
                  : "text-primary-foreground/70"
              )}
            >
              {formatTime(message.createdAt)}
            </div>

            <div className="flex items-center gap-1">
              {/* Кнопки действий */}
              {!isDeleted && <QuoteButton message={message} />}
              {canDelete && (
                <DeleteMessageButton
                  tenantId={tenantId!}
                  accountId={accountId!}
                  chatId={chatId!}
                  messageId={message.id}
                  onSuccess={onDelete}
                />
              )}

              {/* Статус прочитанности для исходящих */}
              {!isIncoming && !isDeleted && (
                <div>
                  {message.isRead ? (
                    <CheckCheck className="size-3 text-primary-foreground/70" />
                  ) : (
                    <Check className="size-3 text-primary-foreground/70" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
