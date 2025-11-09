"use client";

import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/components/ui/avatar";
import { Badge } from "@/shared/ui/components/ui/badge";
import { Separator } from "@/shared/ui/components/ui/separator";
import { Button } from "@/shared/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/components/ui/dropdown-menu";
import {
  BlacklistButton,
  BlacklistDialog,
  useAddToBlacklist,
} from "@/features/add-to-blacklist";
import { useTelegramAuth } from "@/shared/hooks/useTelegramAuth";
import type { ConversationDetails } from "@/entities/conversation";

interface ChatHeaderProps {
  conversation: ConversationDetails;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { authData } = useTelegramAuth();
  const { handleAddToBlacklist, loading, error, isOpen, setIsOpen } =
    useAddToBlacklist();

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

  const handleBlacklist = () => {
    if (!authData?.tenant?.id || !conversation.account?.id) return;

    handleAddToBlacklist(
      authData.tenant.id,
      conversation.account.id,
      [
        {
          avitoUserId: conversation.user.avitoUserId,
          itemId: conversation.item?.itemIdAvito || null,
        },
      ],
      () => {
        // Можно показать уведомление об успехе
        console.log("Пользователь добавлен в черный список");
      }
    );
  };

  return (
    <>
      <div className="p-4 flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(conversation.user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            {conversation.user?.name || "Без имени"}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {conversation.item?.title || "Без объявления"}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {conversation.account?.label && (
            <Badge variant="outline" className="text-xs">
              {conversation.account.label}
            </Badge>
          )}
          {conversation.user.lifecycleStage && (
            <Badge variant="secondary" className="text-xs">
              {conversation.user.lifecycleStage}
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <BlacklistButton onClick={() => setIsOpen(true)} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />

      <BlacklistDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        avitoUserId={conversation.user.avitoUserId}
        userName={conversation.user.name}
        itemId={conversation.item?.itemIdAvito}
        onConfirm={(users) => handleBlacklist()}
        loading={loading}
        error={error}
      />
    </>
  );
}

