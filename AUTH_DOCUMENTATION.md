# Документация процесса авторизации через Telegram

## Описание процесса

Процесс авторизации происходит при загрузке приложения через Telegram Mini App. Клиент отправляет запрос на backend для проверки и создания/обновления пользователя.

## URL запроса

**На клиенте (браузер):**
- Используется Next.js API route: `/api/auth/telegram`
- Это обходит CORS проблемы, так как запрос идет на тот же домен

**На сервере (SSR):**
- Прямой запрос: `${NEXT_PUBLIC_API_BASE_URL}/api/auth/telegram`

**Пример полного URL backend:**
- Production: `https://auto-answer-avt.ru/api/auth/telegram`
- Development: `http://localhost:8000/api/auth/telegram` (если указан в env)

**Важно:** 
- На клиенте запрос идет через Next.js API route (`/api/auth/telegram`), который проксирует запрос на backend
- Это решает проблему CORS, так как браузер делает запрос на тот же домен (Next.js сервер)
- Backend URL все равно нужен для проксирования на сервере Next.js

## Метод запроса

**HTTP Method:** `POST`

## Заголовки запроса

```
Content-Type: application/json
Accept: application/json
```

## Тело запроса (Request Body)

**Формат:** JSON

**Структура:**
```json
{
  "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7c24fe30aec4b2c6b12d74a8dc8f54e7f090"
}
```

**Поле `initData`:**
- Тип: `string`
- Описание: Строка initData от Telegram WebApp SDK, содержащая данные пользователя и подпись
- Формат: URL-encoded query string
- Содержит:
  - `query_id` - уникальный ID запроса
  - `user` - JSON объект с данными пользователя (URL-encoded)
  - `auth_date` - timestamp авторизации
  - `hash` - HMAC-SHA-256 подпись для проверки подлинности

## Ожидаемый ответ (Success Response)

**HTTP Status:** `200 OK`

**Формат:** JSON

**Структура ответа:**
```json
{
  "tenant": {
    "id": "clh1234567890abcdef",
    "name": "Название тенанта"
  },
  "user": {
    "id": "clh0987654321fedcba",
    "telegramId": "279058397",
    "firstName": "Vladislav",
    "lastName": "Kibenko",
    "username": "vdkfrost",
    "photoUrl": "https://...",
    "languageCode": "ru"
  }
}
```

## Возможные ошибки

### 1. Ошибка сети (Network Error)
**Симптомы:**
- `TypeError: Failed to fetch`
- `Сервер временно недоступен. Попробуйте позже.`

**Причины:**
- Сервер недоступен (не запущен, недоступен по сети)
- Неправильный URL (пустой `NEXT_PUBLIC_API_BASE_URL`)
- CORS ошибка (если сервер не настроен для разрешения запросов с текущего домена)
- Проблемы с сетью/интернетом

**Решение:**
- Проверить, что переменная `NEXT_PUBLIC_API_BASE_URL` задана в `.env.local` или `.env`
- Проверить, что backend сервер запущен и доступен
- Проверить настройки CORS на backend

### 2. Ошибка 400 Bad Request
**Причина:** Неверный формат запроса (отсутствует или неверный `initData`)

**Ответ сервера:**
```json
{
  "message": "Неверный формат запроса",
  "code": "INVALID_REQUEST"
}
```

### 3. Ошибка 401 Unauthorized
**Причина:** Невалидный или истекший `initData`

**Ответ сервера:**
```json
{
  "message": "Неавторизован",
  "code": "UNAUTHORIZED"
}
```

### 4. Ошибка 403 Forbidden
**Причина:** Пользователь заблокирован

**Ответ сервера:**
```json
{
  "message": "Аккаунт заблокирован",
  "code": "USER_BLOCKED",
  "reason": "Причина блокировки"
}
```

**Обработка:** Выбрасывается специальное исключение `UserBlockedError`, которое отображает пользователю сообщение о блокировке.

### 5. Ошибка 429 Too Many Requests
**Причина:** Слишком много запросов авторизации

**Ответ сервера:**
```json
{
  "message": "Слишком много запросов. Попробуйте позже.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Логирование

Все запросы и ответы логируются в консоль браузера с префиксом `[auth/telegram]`:

### Перед отправкой запроса:
```javascript
{
  url: "https://auto-answer-avt.ru/api/auth/telegram",
  method: "POST",
  initDataLength: 234,
  initDataPreview: "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22..."
}
```

### После получения ответа:
```javascript
{
  status: 200,
  statusText: "OK",
  ok: true,
  headers: { ... }
}
```

### При успешной авторизации:
```javascript
{
  userId: "clh0987654321fedcba",
  tenantId: "clh1234567890abcdef",
  userName: "Vladislav",
  userRole: "ADMIN",
  hasTenant: true,
  dataKeys: ["tenant", "user"]
}
```

### При ошибке:
```javascript
{
  status: 403,
  errorJson: { message: "...", code: "..." },
  serverMessage: "...",
  serverCode: "..."
}
```

## Поток выполнения

1. **Инициализация Telegram SDK** (`TelegramProvider`)
   - Получение `initData` из Telegram WebApp SDK
   - Сохранение в контексте

2. **Запуск авторизации** (`AuthProxy`)
   - Проверка наличия `initData`
   - Вызов `authenticateTelegram(initData)`

3. **Отправка запроса** (`authenticateTelegram`)
   - **На клиенте:** Формирование URL: `/api/auth/telegram` (Next.js API route)
   - **На сервере:** Формирование URL: `${apiBaseUrl}/api/auth/telegram` (прямой запрос)
   - Создание тела запроса: `{ initData }`
   - Отправка POST запроса через `fetch()`
   - Next.js API route проксирует запрос на backend, обходя CORS

4. **Обработка ответа**
   - Проверка статуса ответа
   - Парсинг JSON ответа
   - Сохранение данных авторизации в store (`useAuthStore`)

5. **Обновление UI**
   - Показ основного контента приложения
   - Или отображение ошибки/блокировки

## Переменные окружения

**Требуется:**
- `NEXT_PUBLIC_API_BASE_URL` - базовый URL backend API

**Пример `.env.local`:**
```
NEXT_PUBLIC_API_BASE_URL=https://auto-answer-avt.ru
```

## Файлы, участвующие в процессе

1. `src/shared/lib/api/telegram.ts` - функция `authenticateTelegram()` (использует Next.js API route на клиенте)
2. `src/app/api/auth/telegram/route.ts` - Next.js API route для проксирования запросов (обходит CORS)
3. `src/shared/providers/AuthProxy.tsx` - компонент, запускающий авторизацию
4. `src/shared/providers/TelegramProvider.tsx` - получение initData от Telegram
5. `src/shared/lib/store.ts` - хранение данных авторизации
6. `src/shared/lib/config.ts` - конфигурация (apiBaseUrl)

## Диагностика проблем

### Проблема: "Failed to fetch"

**ВАЖНО:** Если переменная `NEXT_PUBLIC_API_BASE_URL` уже задана, но ошибка все равно возникает:

1. **Перезапустите dev сервер Next.js!**
   - Переменные окружения с префиксом `NEXT_PUBLIC_` читаются только при старте сервера
   - Остановите сервер (Ctrl+C) и запустите снова: `npm run dev`

2. **Проверьте логи в консоли браузера:**
   - Откройте DevTools (F12) → Console
   - Найдите логи с префиксом `[auth/telegram]`
   - Проверьте значение `apiBaseUrl` в логах
   - Если `apiBaseUrl: ""` или `apiBaseUrl: undefined` → переменная не подхватилась

3. **Проверьте файл `.env.local` или `.env`:**
   ```bash
   cat .env.local
   # Должно быть:
   # NEXT_PUBLIC_API_BASE_URL=https://auto-answer-avt.ru
   ```

4. **Проверьте доступность backend:**
   ```bash
   curl https://auto-answer-avt.ru/api/auth/telegram
   # Должен вернуть ошибку 400 (Bad Request), но не "Failed to fetch"
   ```

5. **Проверьте CORS на backend:**
   - Backend должен разрешать запросы с вашего домена
   - Проверьте заголовки ответа в Network tab браузера

6. **Проверьте SSL сертификат:**
   - Если используется HTTPS, убедитесь, что сертификат валиден
   - В development можно временно использовать HTTP (если backend поддерживает)

### Проблема: Пустой URL в логах

Если в логах видно:
```
apiBaseUrl: ""
url: "/api/auth/telegram"
```

**Причины:**
- Переменная `NEXT_PUBLIC_API_BASE_URL` не задана в `.env.local`
- Dev сервер не был перезапущен после добавления переменной
- Переменная задана неправильно (лишние пробелы, кавычки и т.д.)

**Решение:**
1. Убедитесь, что в `.env.local` есть строка:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://auto-answer-avt.ru
   ```
   Без кавычек, без пробелов вокруг `=`

2. **ОБЯЗАТЕЛЬНО перезапустите dev сервер:**
   ```bash
   # Остановите сервер (Ctrl+C)
   npm run dev
   ```

3. Очистите кеш браузера или откройте в режиме инкогнито

### Проблема: CORS ошибка (РЕШЕНО)

**Решение реализовано:** Запросы авторизации теперь идут через Next.js API route (`/api/auth/telegram`), который проксирует запросы на backend. Это обходит CORS, так как браузер делает запрос на тот же домен.

**Если все еще видите CORS ошибку:**
1. Убедитесь, что файл `src/app/api/auth/telegram/route.ts` существует
2. Перезапустите dev сервер Next.js
3. Проверьте логи в консоли - должно быть `[api/auth/telegram] Проксирование запроса`

**Альтернативное решение (если не хотите использовать proxy):**
- Настроить CORS на backend для разрешения запросов с вашего домена
- Backend должен отправлять заголовок `Access-Control-Allow-Origin: https://ratatatata-answer.ru`
- Или использовать `Access-Control-Allow-Origin: *` для development (не рекомендуется для production)

