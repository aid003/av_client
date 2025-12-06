/**
 * Утилиты для проверки безопасности запросов на фронтенде
 * Обнаруживает подозрительные паттерны, которые могут указывать на попытки атак
 */

/**
 * Список опасных паттернов, которые могут указывать на попытки выполнения команд или эксплуатации уязвимостей
 */
const DANGEROUS_PATTERNS = [
  // Попытки выполнения системных команд
  /\b(busybox|wget|curl|nc|netcat|bash|sh|cmd|powershell)\b/i,
  // Попытки доступа к системным путям
  /\/tmp\/[a-zA-Z0-9]+/i,
  /\/etc\/(passwd|shadow|hosts)/i,
  /\/proc\/self/i,
  // Попытки выполнения скриптов
  /\.(sh|bat|exe|bin|x86|elf)$/i,
  // Подозрительные команды в строках
  /chmod\s+\d+\s+/i,
  /ping\s+[\d.]+/i,
  // Попытки инъекций
  /;\s*(rm|cat|ls|pwd|id|whoami)/i,
  /\|\s*(bash|sh|nc)/i,
  // Подозрительные пути
  /\.\.\/\.\.\//, // Path traversal
];

/**
 * Проверяет строку на наличие подозрительных паттернов
 * @param value - строка для проверки
 * @returns true если обнаружены подозрительные паттерны
 */
export function containsSuspiciousPattern(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.toLowerCase();

  // Проверяем каждый паттерн
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(normalizedValue)) {
      return true;
    }
  }

  return false;
}

/**
 * Проверяет URL на подозрительные паттерны
 * @param url - URL для проверки
 * @returns объект с результатом проверки
 */
export function validateRequestUrl(url: string): {
  isSafe: boolean;
  suspiciousParts: string[];
} {
  const suspiciousParts: string[] = [];

  if (!url || typeof url !== 'string') {
    return { isSafe: true, suspiciousParts: [] };
  }

  try {
    // Проверяем путь
    if (containsSuspiciousPattern(url)) {
      suspiciousParts.push(`url: ${url.substring(0, 100)}`);
    }

    // Проверяем query параметры если есть
    const urlObj = new URL(url, 'http://localhost');
    urlObj.searchParams.forEach((value, key) => {
      if (containsSuspiciousPattern(key) || containsSuspiciousPattern(value)) {
        suspiciousParts.push(`query: ${key}=${value.substring(0, 50)}`);
      }
    });
  } catch (error) {
    // Если URL некорректный, это тоже подозрительно
    suspiciousParts.push('invalid_url_format');
  }

  return {
    isSafe: suspiciousParts.length === 0,
    suspiciousParts,
  };
}

/**
 * Проверяет объект (например, body запроса) на подозрительные паттерны
 * @param obj - объект для проверки
 * @param maxDepth - максимальная глубина рекурсии (по умолчанию 3)
 * @returns объект с результатом проверки
 */
export function validateRequestBody(
  obj: unknown,
  maxDepth: number = 3,
): {
  isSafe: boolean;
  suspiciousFields: string[];
} {
  const suspiciousFields: string[] = [];

  if (maxDepth <= 0) {
    return { isSafe: true, suspiciousFields: [] };
  }

  function checkValue(value: unknown, path: string = ''): void {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string') {
      if (containsSuspiciousPattern(value)) {
        suspiciousFields.push(path || 'root');
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${path}[${index}]`);
      });
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([key, val]) => {
        const newPath = path ? `${path}.${key}` : key;
        checkValue(val, newPath);
      });
    }
  }

  checkValue(obj);

  return {
    isSafe: suspiciousFields.length === 0,
    suspiciousFields,
  };
}

