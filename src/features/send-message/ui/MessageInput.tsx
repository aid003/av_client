"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import { Textarea } from "@/shared/ui/components/ui/textarea";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useQuote } from "@/features/quote-message";
import { useSendMessage } from "../model";
import { QuotePreview } from "./QuotePreview";

interface MessageInputProps {
  tenantId: string;
  accountId: string;
  chatId: string;
  onMessageSent?: () => void;
}

export function MessageInput({
  tenantId,
  accountId,
  chatId,
  onMessageSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const { quotedMessage, clearQuote } = useQuote();
  const { handleSend, loading, error, clearError } = useSendMessage();

  const onSend = useCallback(async () => {
    if (!text.trim() || loading) return;

    try {
      await handleSend(
        tenantId,
        accountId,
        {
          chatId,
          text: text.trim(),
          quotedMessageId: quotedMessage?.id,
        },
        () => {
          setText("");
          clearQuote();
          if (onMessageSent) {
            onMessageSent();
          }
        }
      );
    } catch (err) {
      // Error is handled by the hook
    }
  }, [
    text,
    loading,
    tenantId,
    accountId,
    chatId,
    quotedMessage,
    handleSend,
    clearQuote,
    onMessageSent,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t">
      {quotedMessage && (
        <QuotePreview quotedMessage={quotedMessage} onClear={clearQuote} />
      )}
      
      {error && (
        <div className="px-4 pt-2">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-4 flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) clearError();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className="min-h-[60px] max-h-[200px] resize-none"
          disabled={loading}
        />
        <Button
          onClick={onSend}
          disabled={!text.trim() || loading}
          size="icon"
          className="shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

