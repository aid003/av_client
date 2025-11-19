export type ChatType = 'u2i' | 'u2u';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  profileUrl?: string;
}

export type MessageContentType = 'text' | 'image' | 'call' | 'voice' | 'location' | 'link';

export interface TextMessageContent {
  type: 'text';
  text: string;
}

export interface ImageMessageContent {
  type: 'image';
  url: string;
  thumbnailUrl?: string;
}

export interface CallMessageContent {
  type: 'call';
  duration?: number;
  missed?: boolean;
}

export interface VoiceMessageContent {
  type: 'voice';
  url: string;
  duration?: number;
}

export interface LocationMessageContent {
  type: 'location';
  latitude: number;
  longitude: number;
  address?: string;
}

export interface LinkMessageContent {
  type: 'link';
  url: string;
  title?: string;
  description?: string;
}

export type MessageContent =
  | TextMessageContent
  | ImageMessageContent
  | CallMessageContent
  | VoiceMessageContent
  | LocationMessageContent
  | LinkMessageContent;

export interface MessageQuote {
  messageId: string;
  text?: string;
  authorName?: string;
}

export interface Message {
  id: string;
  chatId: string;
  content: MessageContent;
  isOutgoing: boolean;
  createdAt: string;
  quote?: MessageQuote;
}

export interface ChatItem {
  id?: string;
  title?: string;
  price?: string;
  imageUrl?: string;
  url?: string;
  status?: string;
}

export interface Chat {
  id: string;
  avitoAccountId: string;
  type: ChatType;
  itemId?: string;
  item?: ChatItem;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface ChatsResponse {
  data: Chat[];
  total?: number;
}

export interface MessagesResponse {
  data: Message[];
  total?: number;
}

