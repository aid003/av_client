import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequestUrl, containsSuspiciousPattern } from '@/shared/lib/security-validator.util';

const MAX_LOG_LENGTH = 200;

function truncate(value: string, max = MAX_LOG_LENGTH) {
  return value.length > max ? value.slice(0, max) : value;
}

function getClientIp(request: NextRequest): string {
  const raw = [
    request.headers.get('x-forwarded-for'),
    request.headers.get('x-real-ip'),
  ]
    .filter(Boolean)
    .flatMap((v) => (v as string).split(',').map((part) => part.trim()))
    .filter(Boolean);

  return raw[0] || 'unknown';
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const fullUrl = url.toString();
  const clientIp = getClientIp(request);

  // Проверяем URL на подозрительные паттерны
  const validation = validateRequestUrl(fullUrl);

  if (!validation.isSafe) {
    console.warn('[SECURITY] Blocked suspicious request:', {
      url: truncate(fullUrl),
      suspiciousParts: validation.suspiciousParts,
      ip: clientIp,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return new NextResponse('Forbidden: Suspicious request detected', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Проверяем заголовки на подозрительные паттерны
  const headers: Array<[string, string]> = [];
  request.headers.forEach((value, key) => {
    headers.push([key.toLowerCase(), value]);
  });

  for (const [key, value] of headers) {
    if (containsSuspiciousPattern(key) || containsSuspiciousPattern(value)) {
      console.warn('[SECURITY] Blocked request with suspicious header:', {
        header: key,
        url: truncate(fullUrl),
        ip: clientIp,
      });

      return new NextResponse('Forbidden: Suspicious header detected', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  }

  // Разрешаем запрос
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

