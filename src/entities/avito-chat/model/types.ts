export type ChatType = 'u2i' | 'u2u';

// Типы для аватаров
export interface AvatarImages {
  '25x25'?: string;
  '50x50'?: string;
  '64x64'?: string;
  '96x96'?: string;
  '100x100'?: string;
  '128x128'?: string;
  '132x132'?: string;
  '176x176'?: string;
  '192x192'?: string;
  '256x256'?: string;
  '1024x1024'?: string;
}

export interface Avatar {
  images: AvatarImages;
  default: string;
}

export interface PublicUserProfile {
  url: string;
  avatar?: Avatar;
  item_id: number;
  user_id: number;
}

// Участник чата
export interface Participant {
  id: number; // number, не string!
  name: string;
  parsing_allowed: boolean;
  public_user_profile?: PublicUserProfile;
}

// Типы сообщений
export type MessageType =
  | 'text'
  | 'image'
  | 'system'
  | 'item'
  | 'call'
  | 'link'
  | 'location'
  | 'deleted'
  | 'appCall'
  | 'file'
  | 'video'
  | 'voice';

// Типы контента сообщений
export interface ImageContent {
  sizes: Record<string, { url: string }>;
}

export interface LocationContent {
  kind: string;
  lat: number;
  lon: number;
  text: string;
  title: string;
}

export interface LinkPreview {
  description?: string;
  domain?: string;
  images?: Record<string, { url: string }>;
  title?: string;
  url: string;
}

export interface LinkContent {
  preview?: LinkPreview;
  text?: string;
  url: string;
}

export interface ItemContent {
  image_url?: string;
  item_url?: string;
  price_string?: string;
  title: string;
}

export interface CallContent {
  status: 'missed' | 'completed' | 'rejected';
  target_user_id: number;
}

export interface VoiceContent {
  voice_id: string;
}

// Цитата сообщения
export interface MessageQuote {
  author_id: number;
  content: {
    text?: string;
    image?: ImageContent;
    call?: CallContent;
    voice?: VoiceContent;
    location?: LocationContent;
    link?: LinkContent;
    item?: ItemContent;
  };
  created: number;
  id: string;
  type: string;
}

// Основной тип сообщения (плоская структура!)
export interface Message {
  id: string;
  avitoChatId: string;
  messageId: string;
  type: MessageType;
  authorId: string;
  userId?: string;
  itemId?: string;

  // Контент сообщения - разные поля в зависимости от type
  text?: string;
  image?: ImageContent;
  location?: LocationContent;
  link?: LinkContent;
  item?: ItemContent;
  call?: CallContent;
  voice?: VoiceContent;
  flowId?: string;

  // Метаданные
  created: string; // Unix timestamp as string
  publishedAt: string;
  read?: string; // Unix timestamp as string
  isOutgoing: boolean;
  quote?: MessageQuote;

  createdAt: string;
  updatedAt: string;
}

// Контекст чата (информация о товаре для u2i)
export interface ChatContext {
  type: 'item' | 'u2u';
  value?: {
    id: number;
    url: string;
    title: string;
    images: {
      main: Record<string, string>;
      count: number;
    };
    user_id: number;
    location?: {
      lat: number;
      lon: number;
      title: string;
    };
    status_id: number;
    price_string: string;
  };
}

// Контент последнего сообщения (упрощенная версия)
export interface LastMessageContent {
  text?: string;
  image?: ImageContent;
  call?: CallContent;
  voice?: VoiceContent;
  location?: LocationContent;
  link?: LinkContent;
  item?: ItemContent;
  flow_id?: Record<string, unknown>;
}

// Чат
export interface Chat {
  id: string;
  chatId: string;
  chatType: ChatType;
  avitoAccountId: string;
  avitoAdId?: string;
  participants: Participant[];
  context?: ChatContext;
  lastMessageContent?: LastMessageContent;
  scriptDisabledByManager?: boolean;
  scriptDisabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Упрощенная информация о товаре для UI
export interface ChatItem {
  id?: number;
  title?: string;
  price?: string;
  imageUrl?: string;
  url?: string;
  status?: string;
}

// Ответы API
export type ChatsResponse = Chat[];
export type MessagesResponse = Message[];
