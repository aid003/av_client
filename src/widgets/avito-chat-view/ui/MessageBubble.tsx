import Image from 'next/image';
import { Phone, Mic, MapPin, Link as LinkIcon, Image as ImageIcon, Quote } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Message, MessageContent } from '@/entities/avito-chat';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderMessageContent(content: MessageContent) {
  switch (content.type) {
    case 'text':
      return <p className="text-sm whitespace-pre-wrap break-words">{content.text}</p>;

    case 'image':
      return (
        <div className="space-y-2">
          <div className="relative w-full max-w-sm rounded-lg overflow-hidden bg-muted">
            <Image
              src={content.url}
              alt="Изображение"
              width={400}
              height={300}
              className="object-cover w-full h-auto"
              sizes="(max-width: 400px) 100vw, 400px"
            />
          </div>
        </div>
      );

    case 'call':
      return (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 shrink-0" />
          <span>
            {content.missed ? 'Пропущенный звонок' : 'Звонок'}
            {content.duration && ` (${Math.floor(content.duration / 60)}:${String(Math.floor(content.duration % 60)).padStart(2, '0')})`}
          </span>
        </div>
      );

    case 'voice':
      return (
        <div className="flex items-center gap-2 text-sm">
          <Mic className="h-4 w-4 shrink-0" />
          <span>Голосовое сообщение</span>
          {content.duration && (
            <span className="text-xs text-muted-foreground">
              {Math.floor(content.duration / 60)}:{String(Math.floor(content.duration % 60)).padStart(2, '0')}
            </span>
          )}
        </div>
      );

    case 'location':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>Геолокация</span>
          </div>
          {content.address && (
            <p className="text-xs text-muted-foreground">{content.address}</p>
          )}
          {content.latitude && content.longitude && (
            <a
              href={`https://yandex.ru/maps/?pt=${content.longitude},${content.latitude}&z=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Открыть на карте
            </a>
          )}
        </div>
      );

    case 'link':
      return (
        <div className="space-y-1">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <LinkIcon className="h-4 w-4 shrink-0" />
            <span>{content.title || content.url}</span>
          </a>
          {content.description && (
            <p className="text-xs text-muted-foreground">{content.description}</p>
          )}
        </div>
      );

    default:
      return <p className="text-sm text-muted-foreground">Неподдерживаемый тип сообщения</p>;
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.isOutgoing;

  return (
    <div
      className={cn(
        'flex gap-2 mb-4',
        isOutgoing ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 space-y-1',
          isOutgoing
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {message.quote && (
          <div
            className={cn(
              'border-l-2 pl-2 py-1 mb-2 text-xs',
              isOutgoing
                ? 'border-primary-foreground/30 bg-primary-foreground/10'
                : 'border-muted-foreground/30 bg-muted-foreground/10'
            )}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Quote className="h-3 w-3" />
              {message.quote.authorName && (
                <span className="font-semibold">{message.quote.authorName}</span>
              )}
            </div>
            {message.quote.text && (
              <p className="line-clamp-2">{message.quote.text}</p>
            )}
          </div>
        )}

        {renderMessageContent(message.content)}

        <div
          className={cn(
            'text-xs mt-1',
            isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

