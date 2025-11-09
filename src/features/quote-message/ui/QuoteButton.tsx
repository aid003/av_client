"use client";

import { Reply } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import type { Message } from "@/entities/message";
import { useQuote } from "../model";

interface QuoteButtonProps {
  message: Message;
}

export function QuoteButton({ message }: QuoteButtonProps) {
  const { setQuotedMessage } = useQuote();

  return (
    <Button
      onClick={() => setQuotedMessage(message)}
      size="sm"
      variant="ghost"
      className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Reply className="size-3" />
    </Button>
  );
}

