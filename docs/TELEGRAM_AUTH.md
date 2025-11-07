# Авторизация через Telegram Mini App

## Обзор

Проект настроен для работы с Telegram Mini App и автоматической авторизации пользователей через Telegram.

## Структура

### Провайдеры

#### TelegramProvider (`src/shared/providers/TelegramProvider.tsx`)

Инициализирует Telegram SDK и предоставляет доступ к данным `initData`:

```typescript
const { isInitialized, initData } = useTelegram();
```

#### AuthProxy (`src/shared/providers/AuthProxy.tsx`)

Прокси-компонент, который:
- Показывает лоадер во время авторизации
- Автоматически отправляет `initData` на бэкенд `/auth/telegram`
- Сохраняет данные пользователя в `localStorage`
- Отображает ошибки авторизации при необходимости

### API

#### authenticateTelegram (`src/shared/lib/api/telegram.ts`)

Функция для отправки запроса авторизации:

```typescript
await authenticateTelegram(initData);
```

Отправляет POST запрос на `/auth/telegram` с телом:
```json
{
  "initData": "query_id=..."
}
```

Возвращает:
```typescript
{
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
}
```

### Хуки

#### useTelegram

Доступ к Telegram SDK:

```typescript
const { isInitialized, initData } = useTelegram();
```

#### useTelegramAuth

Доступ к данным авторизованного пользователя:

```typescript
const { authData, isLoading } = useTelegramAuth();
```

## Типы

### TelegramAuthResponse

```typescript
interface TelegramAuthResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
}
```

### TelegramAuthRequest

```typescript
interface TelegramAuthRequest {
  initData: string;
}
```

### TelegramAuthError

```typescript
interface TelegramAuthError {
  message: string;
  code: 'INVALID_INIT_DATA' | 'INVALID_SIGNATURE' | 'INTERNAL_ERROR';
}
```

## Конфигурация

### Переменные окружения

Убедитесь, что в `.env.local` установлена переменная:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
```

## Использование

### В компонентах

```typescript
'use client';

import { useTelegramAuth } from '@/shared/hooks/useTelegramAuth';

export default function MyComponent() {
  const { authData, isLoading } = useTelegramAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!authData) {
    return <div>Не авторизован</div>;
  }

  return (
    <div>
      <h1>Привет, {authData.user.first_name}!</h1>
      <p>Тенант: {authData.tenant.name}</p>
    </div>
  );
}
```

## Как это работает

1. При загрузке приложения `TelegramProvider` инициализирует Telegram SDK
2. `AuthProxy` получает `initData` от Telegram
3. `AuthProxy` отправляет `initData` на бэкенд `/auth/telegram`
4. Бэкенд проверяет подпись и возвращает данные пользователя и тенанта
5. Данные сохраняются в `localStorage` для дальнейшего использования
6. Пользователь перенаправляется на главную страницу
7. Компоненты могут использовать хук `useTelegramAuth` для доступа к данным пользователя

## Режим разработки

Если приложение запущено вне Telegram (например, в браузере), `AuthProxy` не будет блокировать отображение контента, но данные пользователя будут недоступны.

## Обработка ошибок

Возможные коды ошибок от бэкенда:

- `INVALID_INIT_DATA` - Невалидный формат initData (400)
- `INVALID_SIGNATURE` - Невалидная подпись Telegram (401)
- `INTERNAL_ERROR` - Внутренняя ошибка сервера (500)

При ошибке авторизации `AuthProxy` отобразит сообщение об ошибке.

