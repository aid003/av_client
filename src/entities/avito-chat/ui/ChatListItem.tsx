import Image from 'next/image';
import { MessageSquare, Phone, Mic, MapPin, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/components/ui/avatar';
import type { Chat, MessageContent } from '../model/types';

interface ChatListItemProps {
  chat: Chat;
  onClick?: () => void;
}

function getMessagePreview(content?: MessageContent): { text: string; icon?: React.ReactNode } {
  if (!content) {
    return { text: 'Нет сообщений' };
  }

  switch (content.type) {
    case 'text':
      return { text: content.text };
    case 'image':
      return { text: 'Фото', icon: <ImageIcon className="h-4 w-4" /> };
    case 'call':
      return { text: 'Звонок', icon: <Phone className="h-4 w-4" /> };
    case 'voice':
      return { text: 'Голосовое сообщение', icon: <Mic className="h-4 w-4" /> };
    case 'location':
      return { text: 'Геолокация', icon: <MapPin className="h-4 w-4" /> };
    case 'link':
      return { text: content.title || 'Ссылка', icon: <LinkIcon className="h-4 w-4" /> };
    default:
      return { text: 'Сообщение' };
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'только что';
  }
  if (diffMins < 60) {
    return `${diffMins} мин`;
  }
  if (diffHours < 24) {
    return `${diffHours} ч`;
  }
  if (diffDays < 7) {
    return `${diffDays} дн`;
  }
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function getParticipantInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = (parts[0]?.[0] ?? '').toUpperCase();
  const b = (parts[1]?.[0] ?? '').toUpperCase();
  return a + b || 'U';
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const otherParticipant = chat.participants.find((p) => p.id !== chat.avitoAccountId) || chat.participants[0];
  const messagePreview = getMessagePreview(chat.lastMessage?.content);
  const isU2I = chat.type === 'u2i';

  return (
    <Card
      className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            {otherParticipant.avatar ? (
              <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
            ) : null}
            <AvatarFallback>{getParticipantInitials(otherParticipant.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{otherParticipant.name}</h3>
              <Badge variant={isU2I ? 'default' : 'secondary'} className="text-xs shrink-0">
                {isU2I ? 'U2I' : 'U2U'}
              </Badge>
            </div>

            {isU2I && chat.item && (
              <div className="flex items-start gap-2">
                {chat.item.imageUrl && (
                  <div className="relative w-[70px] h-[52px] shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={chat.item.imageUrl}
                      alt={chat.item.title || 'Товар'}
                      fill
                      className="object-cover"
                      sizes="70px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground line-clamp-2" title={chat.item.title}>
                    {chat.item.title}
                  </p>
                  {chat.item.price && (
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        maximumFractionDigits: 0,
                      }).format(parseInt(chat.item.price, 10))}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {messagePreview.icon && <span className="shrink-0">{messagePreview.icon}</span>}
              <span className="truncate flex-1">{messagePreview.text}</span>
              <span className="shrink-0">{formatRelativeTime(chat.updatedAt)}</span>
            </div>
          </div>
        </div>

        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className="flex justify-end">
            <Badge variant="default" className="text-xs">
              {chat.unreadCount}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

