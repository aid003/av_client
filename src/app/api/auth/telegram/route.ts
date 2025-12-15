import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/shared/lib/config';

/**
 * Next.js API Route для проксирования запросов авторизации
 * Это обходит CORS проблемы, так как запрос идет с сервера Next.js
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.initData) {
      return NextResponse.json(
        { message: 'initData is required' },
        { status: 400 }
      );
    }

    const backendUrl = `${config.apiBaseUrl}/api/auth/telegram`;

    let response: Response;
    try {
      response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (fetchError) {
      console.error('[api/auth/telegram] Ошибка fetch к backend:', {
        error: fetchError,
        backendUrl,
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
      });
      return NextResponse.json(
        {
          message: 'Не удалось подключиться к backend серверу',
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        },
        { status: 502 }
      );
    }

    // Проверяем Content-Type перед парсингом
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let data: unknown;
    let rawText: string | undefined;

    if (isJson) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[api/auth/telegram] Ошибка парсинга JSON:', jsonError);
        rawText = await response.text();
        console.error('[api/auth/telegram] Сырой ответ (первые 500 символов):', rawText.substring(0, 500));
        return NextResponse.json(
          {
            message: 'Backend вернул невалидный JSON',
            status: response.status,
            rawResponse: rawText.substring(0, 500),
          },
          { status: 502 }
        );
      }
    } else {
      // Если не JSON, читаем как текст
      rawText = await response.text();
      console.error('[api/auth/telegram] Backend вернул не JSON:', {
        status: response.status,
        contentType,
        responsePreview: rawText.substring(0, 500),
      });

      // Пытаемся понять, что это за ответ
      if (rawText.includes('<html>') || rawText.includes('<!DOCTYPE')) {
        return NextResponse.json(
          {
            message: 'Backend вернул HTML вместо JSON. Возможно, endpoint не существует или произошла ошибка на сервере.',
            status: response.status,
            contentType,
            htmlPreview: rawText.substring(0, 500),
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          message: `Backend вернул неожиданный формат: ${contentType}`,
          status: response.status,
          rawResponse: rawText.substring(0, 500),
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/auth/telegram] Критическая ошибка проксирования:', {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

