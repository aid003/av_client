import { config } from '@/shared/lib/config';
import { getStoredImpersonationToken } from '@/shared/lib/impersonation';
import { handleImpersonationHttpError, useImpersonationStore } from '@/shared/lib/impersonation-store';
import { validateRequestUrl, validateRequestBody } from '@/shared/lib/security-validator.util';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly code?: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

/**
 * Централизованный HTTP client для API запросов
 */
export class ApiClient {
  private baseUrl: string;
  private defaultTimeout = 30000; // 30 секунд
  private defaultRetries = 3;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Создает fetch с таймаутом
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа от сервера');
      }
      throw error;
    }
  }

  /**
   * Проверяет, можно ли повторить запрос при данной ошибке
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Повторяем только для временных ошибок сервера
      return error.status >= 500 && error.status < 600;
    }
    // Повторяем для сетевых ошибок
    return true;
  }

  /**
   * Задержка для retry с exponential backoff
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Нормализуем базовый URL: если env пуст, пробуем использовать origin браузера
    const base =
      this.baseUrl?.trim() ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    if (!base) {
      throw new Error('Базовый URL API не настроен. Задайте NEXT_PUBLIC_API_BASE_URL.');
    }

    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    let url: URL;

    try {
      url = new URL(`${normalizedBase}${normalizedEndpoint}`);
    } catch (error) {
      // Бросаем понятное сообщение вместо неочевидного "string did not match..."
      if (error instanceof TypeError) {
        throw new Error('Некорректный адрес API. Проверьте NEXT_PUBLIC_API_BASE_URL.');
      }
      throw error;
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const urlString = url.toString();

    // Проверяем URL на подозрительные паттерны
    const validation = validateRequestUrl(urlString);
    if (!validation.isSafe) {
      console.error('[API Security] Blocked suspicious URL:', {
        url: urlString.substring(0, 200),
        suspiciousParts: validation.suspiciousParts,
      });
      throw new Error('Запрос содержит подозрительные данные и был заблокирован');
    }

    return urlString;
  }

  private buildHeaders(extra?: HeadersInit): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    if (extra) {
      new Headers(extra).forEach((value, key) => headers.set(key, value));
    }

    const impersonationToken =
      getStoredImpersonationToken() || useImpersonationStore.getState().token;
    if (impersonationToken) {
      headers.set('x-impersonation-token', impersonationToken);

      if (process.env.NODE_ENV === 'development') {
        // Не логируем сам токен, только факт и длину
        // eslint-disable-next-line no-console
        console.log('[API][impersonation] header attached', {
          length: impersonationToken.length,
          preview: `${impersonationToken.slice(0, 6)}...${impersonationToken.slice(-6)}`,
        });
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[API] ${response.url} - ${response.status}`);
    }

    if (!response.ok) {
      let errorMessage = `Ошибка ${response.status}`;
      let errorCode: string | undefined;

      // Специальные сообщения для разных статусов
      switch (response.status) {
        case 400:
          errorMessage = 'Некорректный запрос';
          break;
        case 401:
          errorMessage = 'Неавторизован';
          break;
        case 403:
          errorMessage = 'Доступ запрещен';
          break;
        case 404:
          errorMessage = 'Ресурс не найден';
          break;
        case 429:
          errorMessage = 'Слишком много запросов. Попробуйте позже';
          break;
        case 500:
          errorMessage = 'Внутренняя ошибка сервера';
          break;
        case 502:
        case 503:
          errorMessage = 'Сервис временно недоступен';
          break;
      }

      // Попытка получить детальное сообщение от сервера
      let errorData: unknown;
      try {
        const errorJson = await response.json();
        errorData = errorJson;
        errorMessage = errorJson?.message || errorJson?.error || errorMessage;
        errorCode = errorJson?.code;

        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('[API] Error JSON:', errorJson);
        }
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Используем дефолтное сообщение
        }
      }

      // Нормализация «технических» сообщений от внешних сервисов
      if (errorMessage === 'The string did not match the expected pattern.') {
        errorMessage =
          'Ошибка при обращении к внешнему сервису. Попробуйте выполнить действие позже.';
      }

      handleImpersonationHttpError(response.status, errorMessage);

      throw new ApiError(
        response.status,
        response.statusText,
        errorMessage,
        errorCode,
        errorData
      );
    }

    // Для пустых ответов (204 No Content, DELETE и т.д.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Получаем текст ответа
    const text = await response.text();

    // Если текст пустой, возвращаем undefined
    if (!text || text.trim() === '') {
      return undefined as T;
    }

    // Пытаемся распарсить как JSON
    try {
      return JSON.parse(text);
    } catch (error) {
      // Если не удалось распарсить, логируем и возвращаем undefined
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('[API] Failed to parse response as JSON:', text.substring(0, 100));
      }
      return undefined as T;
    }
  }

  /**
   * GET запрос
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options?: RequestConfig
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? this.defaultRetries;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'GET',
            mode: 'cors',
            headers: this.buildHeaders(options?.headers),
            signal: options?.signal,
          },
          timeout
        );

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        // Проверяем, нужно ли повторить запрос
        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Сервер временно недоступен. Попробуйте позже');
  }

  /**
   * POST запрос
   */
  async post<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    // Проверяем body на подозрительные паттерны перед отправкой
    if (data) {
      const bodyValidation = validateRequestBody(data);
      if (!bodyValidation.isSafe) {
        console.error('[API Security] Blocked suspicious request body:', {
          endpoint,
          suspiciousFields: bodyValidation.suspiciousFields,
        });
        throw new Error('Данные запроса содержат подозрительные паттерны и были заблокированы');
      }
    }

    const url = this.buildUrl(endpoint, options?.params);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? 0; // POST по умолчанию не повторяем

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'POST',
            mode: 'cors',
            headers: this.buildHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
          },
          timeout
        );

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Сервер временно недоступен. Попробуйте позже');
  }

  /**
   * PUT запрос
   */
  async put<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    // Проверяем body на подозрительные паттерны перед отправкой
    if (data) {
      const bodyValidation = validateRequestBody(data);
      if (!bodyValidation.isSafe) {
        console.error('[API Security] Blocked suspicious request body:', {
          endpoint,
          suspiciousFields: bodyValidation.suspiciousFields,
        });
        throw new Error('Данные запроса содержат подозрительные паттерны и были заблокированы');
      }
    }

    const url = this.buildUrl(endpoint, options?.params);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? 0;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'PUT',
            mode: 'cors',
            headers: this.buildHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
          },
          timeout
        );

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Сервер временно недоступен. Попробуйте позже');
  }

  /**
   * DELETE запрос
   */
  async delete<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? 0;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'DELETE',
            mode: 'cors',
            headers: this.buildHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
          },
          timeout
        );

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Сервер временно недоступен. Попробуйте позже');
  }

  /**
   * PATCH запрос
   */
  async patch<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    // Проверяем body на подозрительные паттерны перед отправкой
    if (data) {
      const bodyValidation = validateRequestBody(data);
      if (!bodyValidation.isSafe) {
        console.error('[API Security] Blocked suspicious request body:', {
          endpoint,
          suspiciousFields: bodyValidation.suspiciousFields,
        });
        throw new Error('Данные запроса содержат подозрительные паттерны и были заблокированы');
      }
    }

    const url = this.buildUrl(endpoint, options?.params);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const maxRetries = options?.retries ?? 0;

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          {
            method: 'PATCH',
            mode: 'cors',
            headers: this.buildHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
          },
          timeout
        );

        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;

        if (error instanceof ApiError) {
          throw error;
        }

        if (attempt < maxRetries && this.isRetryableError(error)) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Сервер временно недоступен. Попробуйте позже');
  }
}

// Экземпляр клиента для использования в приложении
export const apiClient = new ApiClient(config.apiBaseUrl);
