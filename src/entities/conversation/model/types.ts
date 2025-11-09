// Базовые типы для пользователя
export interface ConversationUser {
  id: string;
  avitoUserId: string;
  name: string;
  industry?: string;
  region?: string;
  lifecycleStage: string;
  loyalty?: string;
}

// Базовый пользователь для списка (меньше полей)
export interface ConversationUserBrief {
  id: string;
  avitoUserId: string;
  name: string;
  lifecycleStage: string;
}

// Привязка чата
export interface ChatBinding {
  id: string;
  accountId: string;
  chatType: string;
  itemId: string;
}

// Аккаунт
export interface ConversationAccount {
  id: string;
  companyUserId: string;
  label: string;
}

// Объявление
export interface ConversationItem {
  id: string;
  itemIdAvito: string;
  title: string;
  internalStatus?: string;
  primaryImageUrl?: string;
  price?: string;
  url?: string;
}

// Последнее сообщение
export interface LastMessage {
  id: string;
  direction: "IN" | "OUT";
  type: string;
  contentJson: {
    text: string;
  };
  createdAt: string;
  authorAvitoUserId?: string | null;
}

// Сценарий
export interface Scenario {
  id: string;
  name: string;
  version: number;
}

// Текущий узел
export interface CurrentNode {
  id: string;
  type: string;
}

// Маркер
export interface Marker {
  id: string;
  status: string;
  attempts: number;
  answeredAt?: string;
}

// Основной тип диалога для списка
export interface Conversation {
  id: string;
  chatId: string;
  lastSeenAt: string;
  stageWeight: number;
  createdAt: string;
  updatedAt: string;
  user: ConversationUserBrief;
  chatBinding: ChatBinding;
  account: ConversationAccount;
  item: ConversationItem;
  lastMessage?: LastMessage;
  unreadCount: number;
}

// Расширенная версия диалога с полными деталями
export interface ConversationDetails {
  id: string;
  chatId: string;
  lastSeenAt: string;
  stageWeight: number;
  createdAt: string;
  updatedAt: string;
  user: ConversationUser;
  chatBinding: ChatBinding;
  account: ConversationAccount;
  item: ConversationItem;
  unreadCount: number;
  scenario?: Scenario;
  currentNode?: CurrentNode;
  markers?: Marker[];
}

// Ответ со списком диалогов
export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
}

// Фильтры для диалогов
export interface ConversationFilters {
  accountId?: string;
  unreadOnly?: boolean;
  sortBy?: "lastSeenAt" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Статистика по аккаунту
export interface AccountStats {
  accountId: string;
  companyUserId: string;
  label: string;
  totalChats: number;
  unreadChats: number;
  totalMessages: number;
  lastActivity: string;
}

// Общая статистика
export interface Stats {
  totalConversations: number;
  totalUnread: number;
  totalMessages: number;
  accountStats: AccountStats[];
}

// Ошибки
export interface ConversationError {
  message: string;
  statusCode: number;
}

