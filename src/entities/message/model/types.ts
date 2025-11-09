// Типы сообщений
export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VOICE"
  | "LINK"
  | "ITEM"
  | "LOCATION"
  | "CALL"
  | "SYSTEM"
  | "DELETED";

// Цитируемое сообщение
export interface QuotedMessage {
  id: string;
  type: MessageType;
  contentJson: {
    text?: string;
    [key: string]: any;
  };
  authorAvitoUserId?: string | null;
  createdAt: string;
}

// Основной интерфейс сообщения
export interface Message {
  id: string;
  direction: "IN" | "OUT";
  type: MessageType;
  contentJson: {
    text?: string;
    [key: string]: any;
  };
  confidence?: number | null;
  authorAvitoUserId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  primaryImageUrl?: string | null;
  quote?: QuotedMessage | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface MessageError {
  message: string;
  statusCode: number;
}

// Типы для отправки сообщений
export interface SendMessageRequest {
  chatId: string;
  text: string;
  quotedMessageId?: string;
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  userId: string;
  chatBindingId: string;
  itemId?: string | null;
}

// Типы для удаления сообщений
export interface DeleteMessageResponse {
  ok: boolean;
}

// Типы для пометки прочитанным
export interface MarkAsReadRequest {
  messageIds?: string[];
}

export interface MarkAsReadResponse {
  count: number;
}

// Типы для голосовых файлов
export interface VoiceFilesRequest {
  voiceIds: string[];
}

export interface VoiceFilesResponse {
  voices_urls: Record<string, string>;
}

// Типы для черного списка
export interface BlacklistUser {
  avitoUserId: string;
  itemId?: string | null;
  reasonId?: number;
}

export interface AddToBlacklistRequest {
  users: BlacklistUser[];
}

export interface AddToBlacklistResponse {
  ok: boolean;
}

