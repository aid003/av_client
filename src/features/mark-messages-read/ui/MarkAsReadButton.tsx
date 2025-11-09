"use client";

import { CheckCheck } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import { useMarkAsRead } from "../model";

interface MarkAsReadButtonProps {
  tenantId: string;
  conversationId: string;
  unreadCount: number;
  onSuccess?: () => void;
}

export function MarkAsReadButton({
  tenantId,
  conversationId,
  unreadCount,
  onSuccess,
}: MarkAsReadButtonProps) {
  const { handleMarkAsRead, loading } = useMarkAsRead();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Button
      onClick={() =>
        handleMarkAsRead(tenantId, conversationId, undefined, onSuccess)
      }
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <CheckCheck className="size-4" />
      Отметить как прочитанное ({unreadCount})
    </Button>
  );
}

