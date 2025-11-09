"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import type { Message } from "@/entities/message";

interface QuotePreviewProps {
  quotedMessage: Message;
  onClear: () => void;
}

export function QuotePreview({ quotedMessage, onClear }: QuotePreviewProps) {
  return (
    <div className="px-4 py-2 bg-muted border-l-2 border-l-primary flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          Ответ на сообщение
        </div>
        <div className="text-sm truncate">
          {quotedMessage.contentJson?.text || "Сообщение"}
        </div>
      </div>
      <Button
        onClick={onClear}
        size="sm"
        variant="ghost"
        className="size-6 p-0 shrink-0"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

