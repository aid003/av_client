import { config } from '@/shared/lib/config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Централизованный HTTP client для API запросов
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
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
      try {
        const errorJson = await response.json();
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

      throw new ApiError(
        response.status,
        response.statusText,
        errorMessage,
        errorCode
      );
    }

    // Для пустых ответов (204 No Content, DELETE и т.д.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return await response.json();
  }

  /**
   * GET запрос
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Сервер временно недоступен. Попробуйте позже');
    }
  }

  /**
   * POST запрос
   */
  async post<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Сервер временно недоступен. Попробуйте позже');
    }
  }

  /**
   * PUT запрос
   */
  async put<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Сервер временно недоступен. Попробуйте позже');
    }
  }

  /**
   * DELETE запрос
   */
  async delete<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Сервер временно недоступен. Попробуйте позже');
    }
  }

  /**
   * PATCH запрос
   */
  async patch<T, D = unknown>(endpoint: string, data?: D, options?: RequestConfig): Promise<T> {
    const url = this.buildUrl(endpoint, options?.params);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Сервер временно недоступен. Попробуйте позже');
    }
  }
}

// Экземпляр клиента для использования в приложении
export const apiClient = new ApiClient(config.apiBaseUrl);
