'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Phone, Mic, MapPin, Link as LinkIcon, Image as ImageIcon, Quote, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Message } from '@/entities/avito-chat';

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

function MessageImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="relative w-full max-w-sm rounded-lg overflow-hidden bg-muted/50 aspect-video flex items-center justify-center border border-border">
        <div className="text-center space-y-2">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Не удалось загрузить изображение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full rounded-lg overflow-hidden bg-muted">
      <Image
        src={imageUrl}
        alt={alt}
        width={400}
        height={300}
        className="object-cover w-full h-auto"
        sizes="(max-width: 400px) 100vw, 400px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

function renderMessageContent(message: Message) {
  switch (message.type) {
    case 'text':
      return <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>;

    case 'image':
      if (message.image?.sizes) {
        // Получаем URL первого доступного размера
        const imageUrl = Object.values(message.image.sizes)[0]?.url;
        if (imageUrl) {
          return (
            <div className="space-y-2">
              <MessageImage imageUrl={imageUrl} alt="Изображение" />
            </div>
          );
        }
      }
      return (
        <div className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4 shrink-0" />
          <span>Изображение</span>
        </div>
      );

    case 'call':
      return (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 shrink-0" />
          <span>
            {message.call?.status === 'missed' ? 'Пропущенный звонок' : 'Звонок'}
          </span>
        </div>
      );

    case 'voice':
      return (
        <div className="flex items-center gap-2 text-sm">
          <Mic className="h-4 w-4 shrink-0" />
          <span>Голосовое сообщение</span>
        </div>
      );

    case 'location':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>Геолокация</span>
          </div>
          {message.location?.title && (
            <p className="text-xs break-words">{message.location.title}</p>
          )}
          {message.location?.lat && message.location?.lon && (
            <a
              href={`https://yandex.ru/maps/?pt=${message.location.lon},${message.location.lat}&z=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline break-all"
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
            href={message.link?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <LinkIcon className="h-4 w-4 shrink-0" />
            <span className="break-all">{message.link?.preview?.title || message.link?.text || message.link?.url}</span>
          </a>
          {message.link?.preview?.description && (
            <p className="text-xs opacity-80 break-words">{message.link.preview.description}</p>
          )}
        </div>
      );

    case 'item':
      if (message.item) {
        return (
          <div className="space-y-2">
            <a
              href={message.item.item_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline break-words"
            >
              {message.item.title}
            </a>
            {message.item.price_string && (
              <p className="text-xs font-semibold">{message.item.price_string}</p>
            )}
          </div>
        );
      }
      return <p className="text-sm">Товар</p>;

    case 'system':
      return (
        <p className="text-xs text-center italic opacity-70">
          {message.text || 'Системное сообщение'}
        </p>
      );

    case 'deleted':
      return <p className="text-sm italic opacity-50">Сообщение удалено</p>;

    case 'file':
    case 'video':
      return (
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 shrink-0" />
          <span>{message.type === 'file' ? 'Файл' : 'Видео'}</span>
        </div>
      );

    default:
      return (
        <p className="text-sm opacity-70">
          Неподдерживаемый тип сообщения: {message.type}
        </p>
      );
  }
}

interface MessageBubbleWithContextProps extends MessageBubbleProps {
  currentAuthorId?: string;
}

export function MessageBubble({ message, currentAuthorId }: MessageBubbleWithContextProps) {
  // Определяем, является ли сообщение исходящим на основе authorId
  // Если currentAuthorId не передан, используем isOutgoing как fallback
  const isOutgoing = currentAuthorId 
    ? message.authorId === currentAuthorId 
    : message.isOutgoing;

  // Системные сообщения отображаем по-особому
  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-muted/50 rounded-full px-3 py-1.5">
          {renderMessageContent(message)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex gap-2', isOutgoing ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] md:max-w-[75%] rounded-xl px-3.5 py-2.5 space-y-1.5',
          isOutgoing
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        {message.quote && (
          <div
            className={cn(
              'border-l-2 pl-2 py-1 mb-2 text-xs rounded',
              isOutgoing
                ? 'border-primary-foreground/30 bg-primary-foreground/10'
                : 'border-muted-foreground/30 bg-muted-foreground/10'
            )}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <Quote className="h-3 w-3" />
            </div>
            {message.quote.content?.text && (
              <p className="line-clamp-2 break-words">{message.quote.content.text}</p>
            )}
          </div>
        )}

        {renderMessageContent(message)}

        <div
          className={cn(
            'text-[11px] mt-1',
            isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.publishedAt)}
        </div>
      </div>
    </div>
  );
}
