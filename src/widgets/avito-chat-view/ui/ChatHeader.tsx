import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/components/ui/avatar';
import { Button } from '@/shared/ui/components/ui/button';
import type { Chat } from '@/entities/avito-chat';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

function getParticipantInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = (parts[0]?.[0] ?? '').toUpperCase();
  const b = (parts[1]?.[0] ?? '').toUpperCase();
  return a + b || 'U';
}

export function ChatHeader({ chat, onBack, showBackButton = false }: ChatHeaderProps) {
  const otherParticipant = chat.participants.find((p) => p.id.toString() !== chat.avitoAccountId) || chat.participants[0];

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <Avatar className="h-10 w-10 shrink-0">
        {otherParticipant?.public_user_profile?.avatar?.default ? (
          <AvatarImage
            src={otherParticipant.public_user_profile.avatar.default}
            alt={otherParticipant.name}
          />
        ) : null}
        <AvatarFallback>{getParticipantInitials(otherParticipant?.name || 'U')}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-base truncate">{otherParticipant?.name || 'Без имени'}</h2>
        {chat.chatType === 'u2i' && (
          <p className="text-xs text-muted-foreground">Чат по объявлению</p>
        )}
      </div>

      {otherParticipant?.public_user_profile?.url && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="shrink-0"
        >
          <a
            href={otherParticipant.public_user_profile.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Открыть профиль"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}

