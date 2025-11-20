import Image from 'next/image';
import { MessageSquare, Phone, Mic, MapPin, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/components/ui/avatar';
import type { Chat, LastMessageContent } from '../model/types';

interface ChatListItemProps {
  chat: Chat;
  onClick?: () => void;
}

function getMessagePreview(content?: LastMessageContent): { text: string; icon?: React.ReactNode } {
  if (!content) {
    return { text: 'Нет сообщений' };
  }

  if (content.text) {
    return { text: content.text };
  }
  if (content.image) {
    return { text: 'Фото', icon: <ImageIcon className="h-4 w-4" /> };
  }
  if (content.call) {
    return { text: 'Звонок', icon: <Phone className="h-4 w-4" /> };
  }
  if (content.voice) {
    return { text: 'Голосовое сообщение', icon: <Mic className="h-4 w-4" /> };
  }
  if (content.location) {
    return { text: 'Геолокация', icon: <MapPin className="h-4 w-4" /> };
  }
  if (content.link) {
    return { text: content.link.preview?.title || content.link.text || 'Ссылка', icon: <LinkIcon className="h-4 w-4" /> };
  }
  if (content.item) {
    return { text: content.item.title || 'Товар' };
  }

  return { text: 'Сообщение' };
}

function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) {
    return '—';
  }

  // Пробуем разные форматы даты
  let date: Date;
  
  // Если это Unix timestamp (число в строке)
  if (/^\d+$/.test(dateString)) {
    const timestamp = parseInt(dateString, 10);
    // Если это секунды, а не миллисекунды
    date = timestamp < 10000000000 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
  } else {
    date = new Date(dateString);
  }

  // Проверяем валидность даты
  if (isNaN(date.getTime())) {
    return '—';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Если дата в будущем, показываем "только что"
  if (diffMs < 0) {
    return 'только что';
  }

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
  
  try {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

function getParticipantInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = (parts[0]?.[0] ?? '').toUpperCase();
  const b = (parts[1]?.[0] ?? '').toUpperCase();
  return a + b || 'U';
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const otherParticipant = chat.participants.find((p) => p.id.toString() !== chat.avitoAccountId) || chat.participants[0];
  const messagePreview = getMessagePreview(chat.lastMessageContent);
  const isU2I = chat.chatType === 'u2i';

  // Получаем информацию о товаре из context
  const itemInfo = chat.context?.type === 'item' ? chat.context.value : null;

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer p-0"
      onClick={onClick}
    >
      <CardContent className="p-2.5">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-8 w-8 shrink-0">
            {otherParticipant?.public_user_profile?.avatar?.default ? (
              <AvatarImage src={otherParticipant.public_user_profile.avatar.default} alt={otherParticipant.name} />
            ) : null}
            <AvatarFallback className="text-xs">{getParticipantInitials(otherParticipant?.name || 'U')}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="font-semibold text-sm truncate">{otherParticipant?.name || 'Без имени'}</h3>
              <span className="text-[11px] text-muted-foreground shrink-0">
                {formatRelativeTime(chat.updatedAt || chat.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {messagePreview.icon && <span className="shrink-0 w-3 h-3">{messagePreview.icon}</span>}
              <span className="truncate flex-1">{messagePreview.text}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              <Badge variant={isU2I ? 'default' : 'secondary'} className="text-[9px] h-3 px-1 leading-none">
                {isU2I ? 'U2I' : 'U2U'}
              </Badge>
              {isU2I && itemInfo && (
                <>
                  <span className="text-muted-foreground truncate">{itemInfo.title}</span>
                  {itemInfo.price_string && (
                    <span className="font-semibold text-primary shrink-0">{itemInfo.price_string}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

