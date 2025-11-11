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
        <div className="px-2 py-1.5">
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-2 flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) clearError();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className="min-h-[38px] max-h-[200px] resize-none text-sm"
          disabled={loading}
        />
        <Button
          onClick={onSend}
          disabled={!text.trim() || loading}
          size="icon"
          className="shrink-0 h-9 w-9"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

