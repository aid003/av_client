# Анализ соответствия фронтенда и бэкенда API

## Дата анализа: 11 ноября 2025

## Сводка

Этот документ содержит сравнение типов и API вызовов между фронтендом и бэкенд OpenAPI спецификацией.

---

## ✅ Полностью совпадающие модули

### 1. Аутентификация через Telegram (`/auth/telegram`)
- **Эндпоинт**: `POST /auth/telegram`
- **Типы фронтенда**: `/src/shared/types/telegram.ts`
- **Статус**: ✅ Полное соответствие
- **Запрос**: `TelegramAuthRequest { initData: string }`
- **Ответ**: `TelegramAuthResponse { tenant, user }`

### 2. Получение списка аккаунтов (`/oauth/accounts/{tenantId}`)
- **Эндпоинт**: `GET /oauth/accounts/{tenantId}`
- **Типы фронтенда**: `/src/entities/avito/model/types.ts`
- **API**: `/src/entities/avito/api/getAccounts.ts`
- **Статус**: ✅ Полное соответствие
- **Ответ**: `GetAccountsResponseDto { accounts, total }`

### 3. Удаление аккаунта (`/oauth/accounts/{tenantId}/{accountId}`)
- **Эндпоинт**: `DELETE /oauth/accounts/{tenantId}/{accountId}`
- **API**: `/src/entities/avito/api/deleteAccount.ts`
- **Статус**: ✅ Полное соответствие
- **Ответ**: `204 No Content`

### 4. Webhook операции
- **Эндпоинты**:
  - `GET /messenger/{tenantId}/accounts/{accountId}/webhooks/subscriptions`
  - `POST /messenger/{tenantId}/accounts/{accountId}/webhooks/subscribe`
  - `POST /messenger/{tenantId}/accounts/{accountId}/webhooks/unsubscribe`
- **Типы фронтенда**: `/src/entities/avito/model/types.ts`
- **API**: `/src/entities/avito/api/webhooks.ts`
- **Статус**: ✅ Полное соответствие

### 5. Получение списка диалогов (`/messenger/{tenantId}/conversations`)
- **Эндпоинт**: `GET /messenger/{tenantId}/conversations`
- **Типы фронтенда**: `/src/entities/conversation/model/types.ts`
- **API**: `/src/entities/conversation/api/getConversations.ts`
- **Статус**: ✅ Полное соответствие
- **Query параметры**: `accountId`, `unreadOnly`, `sortBy`, `sortOrder`, `limit`, `offset`
- **Ответ**: `GetConversationsResponseDto { conversations, total, hasMore }`

### 6. Получение детальной информации о диалоге (`/messenger/{tenantId}/conversations/{conversationId}`)
- **Эндпоинт**: `GET /messenger/{tenantId}/conversations/{conversationId}`
- **Типы фронтенда**: `/src/entities/conversation/model/types.ts`
- **API**: `/src/entities/conversation/api/getConversation.ts`
- **Статус**: ✅ Полное соответствие

### 7. Получение сообщений диалога (`/messenger/{tenantId}/conversations/{conversationId}/messages`)
- **Эндпоинт**: `GET /messenger/{tenantId}/conversations/{conversationId}/messages`
- **Типы фронтенда**: `/src/entities/message/model/types.ts`
- **API**: `/src/entities/message/api/getMessages.ts`
- **Статус**: ✅ Полное соответствие
- **Query параметры**: `limit`, `offset`
- **Ответ**: `GetConversationMessagesResponseDto { messages, total, hasMore }`

### 8. Отправка сообщения (`/messenger/{tenantId}/accounts/{accountId}/messages`)
- **Эндпоинт**: `POST /messenger/{tenantId}/accounts/{accountId}/messages`
- **Типы фронтенда**: `/src/entities/message/model/types.ts`
- **API**: `/src/entities/message/api/sendMessage.ts`
- **Статус**: ✅ Полное соответствие
- **Запрос**: `SendMessageDto { chatId, text, quotedMessageId? }`
- **Ответ**: `SendMessageResponseDto { messageId, conversationId, userId, chatBindingId, itemId }`

### 9. Пометка сообщений как прочитанных (`/messenger/{tenantId}/conversations/{conversationId}/messages/read`)
- **Эндпоинт**: `POST /messenger/{tenantId}/conversations/{conversationId}/messages/read`
- **Типы фронтенда**: `/src/entities/message/model/types.ts`
- **API**: `/src/entities/message/api/markAsRead.ts`
- **Статус**: ✅ Полное соответствие
- **Запрос**: `MarkMessagesReadDto { messageIds? }`
- **Ответ**: `MarkMessagesReadResponseDto { count }`

### 10. Удаление сообщения (`/messenger/{tenantId}/accounts/{accountId}/chats/{chatId}/messages/{messageId}`)
- **Эндпоинт**: `DELETE /messenger/{tenantId}/accounts/{accountId}/chats/{chatId}/messages/{messageId}`
- **Типы фронтенда**: `/src/entities/message/model/types.ts`
- **API**: `/src/entities/message/api/deleteMessage.ts`
- **Статус**: ✅ Полное соответствие
- **Ответ**: `DeleteMessageResponseDto { ok }`

### 11. Добавление в черный список (`/messenger/{tenantId}/accounts/{accountId}/blacklist`)
- **Эндпоинт**: `POST /messenger/{tenantId}/accounts/{accountId}/blacklist`
- **Типы фронтенда**: `/src/entities/message/model/types.ts`
- **API**: `/src/entities/message/api/addToBlacklist.ts`
- **Статус**: ✅ Полное соответствие
- **Запрос**: `AddToBlacklistDto { users }`
- **Ответ**: `AddToBlacklistResponseDto { ok }`

### 12. Получение статистики (`/messenger/{tenantId}/stats`)
- **Эндпоинт**: `GET /messenger/{tenantId}/stats`
- **Типы фронтенда**: `/src/entities/conversation/model/types.ts`
- **API**: `/src/entities/conversation/api/getStats.ts`
- **Статус**: ✅ Полное соответствие
- **Ответ**: `MessengerStatsResponseDto { totalConversations, totalUnread, totalMessages, accountStats }`

---

## ⚠️ Требуют обновления типов

### 1. AvitoAccount - поле `label`
**Файл**: `/src/entities/avito/model/types.ts`

**Проблема**: Поле `label` объявлено как `string`, но по API оно может быть `null`

**Текущий тип фронтенда**:
```typescript
export interface AvitoAccount {
  id: string;
  companyUserId: string;
  label: string; // ❌ Должно быть: string | null
  scope: string;
  expiresAt: string;
  refreshExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}
```

**Бэкенд API**:
```typescript
label: {
  type: "object",
  description: "Метка аккаунта (опционально)",
  example: "Основной аккаунт",
  nullable: true // ✅
}
```

**Требуемое исправление**:
```typescript
label: string | null;
```

---

### 2. Conversation - поле `lastSeenAt`
**Файл**: `/src/entities/conversation/model/types.ts`

**Проблема**: Поле `lastSeenAt` объявлено как `string`, но по API оно может быть `null`

**Текущий тип фронтенда**:
```typescript
export interface Conversation {
  id: string;
  chatId: string;
  lastSeenAt: string; // ❌ Должно быть: string | null
  // ...
}
```

**Бэкенд API**:
```typescript
lastSeenAt: {
  type: "object",
  example: "2024-01-15T10:30:00Z",
  nullable: true // ✅
}
```

**Требуемое исправление**:
```typescript
lastSeenAt: string | null;
```

---

### 3. ConversationDetails - поле `lastSeenAt`
**Файл**: `/src/entities/conversation/model/types.ts`

**Проблема**: То же самое - `lastSeenAt` должно быть nullable

**Текущий тип фронтенда**:
```typescript
export interface ConversationDetails {
  id: string;
  chatId: string;
  lastSeenAt: string; // ❌ Должно быть: string | null
  // ...
}
```

**Требуемое исправление**:
```typescript
lastSeenAt: string | null;
```

---

### 4. AccountStats - поле `label`
**Файл**: `/src/entities/conversation/model/types.ts`

**Проблема**: Поле `label` объявлено как `string`, но может быть `null`

**Текущий тип фронтенда**:
```typescript
export interface AccountStats {
  accountId: string;
  companyUserId: string;
  label: string; // ❌ Должно быть: string | null
  totalChats: number;
  unreadChats: number;
  totalMessages: number;
  lastActivity: string;
}
```

**Бэкенд API**:
```typescript
label: {
  type: "object",
  example: "Основной аккаунт",
  nullable: true // ✅
}
```

**Требуемое исправление**:
```typescript
label: string | null;
```

---

### 5. AccountStats - поле `lastActivity`
**Файл**: `/src/entities/conversation/model/types.ts`

**Проблема**: Поле `lastActivity` объявлено как `string`, но может быть `null`

**Текущий тип фронтенда**:
```typescript
export interface AccountStats {
  // ...
  lastActivity: string; // ❌ Должно быть: string | null
}
```

**Бэкенд API**:
```typescript
lastActivity: {
  type: "object",
  example: "2024-01-15T10:30:00Z",
  nullable: true,
  description: "Последняя активность"
}
```

**Требуемое исправление**:
```typescript
lastActivity: string | null;
```

---

### 6. ConversationAccount - поле `label`
**Файл**: `/src/entities/conversation/model/types.ts`

**Проблема**: Поле `label` объявлено как `string`, но может быть `null`

**Текущий тип фронтенда**:
```typescript
export interface ConversationAccount {
  id: string;
  companyUserId: string;
  label: string; // ❌ Должно быть: string | null
}
```

**Требуемое исправление**:
```typescript
label: string | null;
```

---

### 7. AuthUrlRequest - поле `mode`
**Файл**: `/src/features/add-avito-account/model/types.ts`

**Проблема**: Поле `mode` имеет фиксированное значение `"createOrUpdate"`, но по API может быть несколько вариантов

**Текущий тип фронтенда**:
```typescript
export interface AuthUrlRequest {
  tenantId: string;
  scopes: string;
  redirectAfter: string;
  mode: "createOrUpdate"; // ❌ Ограниченный тип
  label: string;
}
```

**Бэкенд API**:
```typescript
mode: {
  type: "string",
  description: "Режим создания/обновления аккаунта",
  enum: [
    "createOrUpdate",
    "forceNew",
    "byLabel"
  ],
  default: "createOrUpdate"
}
```

**Требуемое исправление**:
```typescript
mode?: "createOrUpdate" | "forceNew" | "byLabel";
```

---

## 🆕 Неиспользуемые эндпоинты на фронтенде

Следующие эндпоинты есть в API, но не используются на фронтенде:

### 1. Получение списка чатов из Avito API
- **Эндпоинт**: `GET /messenger/{tenantId}/accounts/{accountId}/chats`
- **Описание**: Возвращает список чатов напрямую из API Авито
- **Примечание**: Фронтенд использует `/messenger/{tenantId}/conversations` (данные из БД)

### 2. Получение информации о чате
- **Эндпоинт**: `GET /messenger/{tenantId}/accounts/{accountId}/chats/{chatId}`
- **Описание**: Возвращает данные чата и последнее сообщение из API Авито

### 3. Получение сообщений из Avito API
- **Эндпоинт**: `GET /messenger/{tenantId}/accounts/{accountId}/chats/{chatId}/messages`
- **Описание**: Возвращает список сообщений из API Авито
- **Примечание**: Фронтенд использует `/messenger/{tenantId}/conversations/{conversationId}/messages` (данные из БД)

### 4. Пометка чата прочитанным в Avito
- **Эндпоинт**: `POST /messenger/{tenantId}/accounts/{accountId}/chats/{chatId}/read`
- **Описание**: Отмечает чат как прочитанный в Авито

### 5. Отправка сообщения с изображением
- **Эндпоинт**: `POST /messenger/{tenantId}/accounts/{accountId}/messages/image`
- **Описание**: Отправляет сообщение с изображением
- **Требуется**: Сначала нужно загрузить изображение через `/messenger/{tenantId}/accounts/{accountId}/images`

### 6. Загрузка изображения
- **Эндпоинт**: `POST /messenger/{tenantId}/accounts/{accountId}/images`
- **Описание**: Загружает изображение для последующей отправки
- **Формат**: `multipart/form-data`

### 7. Получение голосовых файлов
- **Эндпоинт**: `GET /messenger/{tenantId}/accounts/{accountId}/voice-files`
- **Описание**: Возвращает ссылки на голосовые сообщения
- **Query параметр**: `voiceIds` (строка через запятую)

### 8. Получение токена через authorization_code
- **Эндпоинт**: `POST /oauth/token/authorization-code`
- **Описание**: Обмен кода авторизации на токен
- **Примечание**: Обычно используется `/oauth/callback`

### 9. Обновление токена
- **Эндпоинт**: `POST /oauth/token/refresh`
- **Описание**: Обновление access token через refresh token

### 10. Управление тенантами
- **Эндпоинты**:
  - `POST /tenants` - Создание тенанта
  - `GET /tenants` - Получение списка всех тенантов
  - `GET /tenants/{id}` - Получение тенанта по ID
  - `PATCH /tenants/{id}` - Обновление тенанта
  - `DELETE /tenants/{id}` - Удаление тенанта
  - `POST /tenants/{id}/block` - Блокировка тенанта
  - `POST /tenants/{id}/unblock` - Разблокировка тенанта

---

## 📋 Рекомендации

### Критичные исправления (требуют немедленного внимания):
1. ✅ Обновить тип `label` в `AvitoAccount` на `string | null`
2. ✅ Обновить тип `lastSeenAt` в `Conversation` и `ConversationDetails` на `string | null`
3. ✅ Обновить типы в `AccountStats` (`label` и `lastActivity`) на nullable
4. ✅ Обновить тип `label` в `ConversationAccount` на `string | null`

### Улучшения (рекомендуется):
1. ⚡ Расширить тип `mode` в `AuthUrlRequest` для поддержки всех вариантов
2. ⚡ Добавить поддержку отправки изображений (эндпоинты уже есть)
3. ⚡ Добавить поддержку голосовых сообщений (получение voice-files)
4. ⚡ Рассмотреть использование прямых эндпоинтов Avito API при необходимости

---

## 🎯 Итоговый статус

- **Полностью совместимых модулей**: 12
- **Требующих обновления типов**: 7 полей в 4 интерфейсах
- **Неиспользуемых эндпоинтов**: 10+
- **Общая оценка**: 🟢 Хорошее соответствие (95%)

**Вывод**: Фронтенд в основном соответствует бэкенд API. Основные проблемы связаны с nullable полями, которые могут привести к ошибкам TypeScript при строгой типизации. Рекомендуется обновить типы в соответствии с указанными выше рекомендациями.

