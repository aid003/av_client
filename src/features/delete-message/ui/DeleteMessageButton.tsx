"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/components/ui/button";
import { useDeleteMessage } from "../model";

interface DeleteMessageButtonProps {
  tenantId: string;
  accountId: string;
  chatId: string;
  messageId: string;
  onSuccess?: () => void;
}

export function DeleteMessageButton({
  tenantId,
  accountId,
  chatId,
  messageId,
  onSuccess,
}: DeleteMessageButtonProps) {
  const { handleDelete, loading } = useDeleteMessage();

  return (
    <Button
      onClick={() =>
        handleDelete(tenantId, accountId, chatId, messageId, onSuccess)
      }
      disabled={loading}
      size="sm"
      variant="ghost"
      className="size-7 p-0 opacity-0 group-hover:opacity-100 transition-all text-destructive hover:text-destructive hover:bg-destructive/10 backdrop-blur-sm"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

