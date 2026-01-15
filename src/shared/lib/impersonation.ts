const IMPERSONATION_STORAGE_KEY = 'impersonation_token';
export const IMPERSONATION_QUERY_PARAM = 'impersonation_token';

type StorageType = 'session' | 'local';

function getStorage(prefer: StorageType): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return prefer === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function getStorageCandidates(): Array<Storage | null> {
  return [getStorage('session'), getStorage('local')];
}

export function isValidImpersonationToken(token: string | null | undefined): token is string {
  if (!token) {
    return false;
  }

  const trimmed = token.trim();
  const parts = trimmed.split('.');

  return trimmed.length >= 50 && parts.length === 3 && parts.every(Boolean);
}

export function persistImpersonationToken(
  token: string,
  preferredStorage: StorageType = 'session'
): void {
  if (!isValidImpersonationToken(token)) {
    return;
  }

  const targetStorage =
    getStorage(preferredStorage) ||
    getStorage(preferredStorage === 'session' ? 'local' : 'session');

  try {
    targetStorage?.setItem(IMPERSONATION_STORAGE_KEY, token);

    // Очищаем альтернативное хранилище, чтобы не держать дубликаты
    if (preferredStorage === 'session') {
      getStorage('local')?.removeItem(IMPERSONATION_STORAGE_KEY);
    }
  } catch {
    // Игнорируем ошибки записи в storage (например, приватный режим)
  }
}

export function getStoredImpersonationToken(): string | null {
  for (const storage of getStorageCandidates()) {
    try {
      const token = storage?.getItem(IMPERSONATION_STORAGE_KEY);
      if (token) {
        if (isValidImpersonationToken(token)) {
          return token;
        }
        storage?.removeItem(IMPERSONATION_STORAGE_KEY);
      }
    } catch {
      // Игнорируем ошибки чтения
    }
  }

  return null;
}

export function clearImpersonationTokenFromStorage(): void {
  getStorageCandidates().forEach((storage) => {
    try {
      storage?.removeItem(IMPERSONATION_STORAGE_KEY);
    } catch {
      // Игнорируем ошибки очистки
    }
  });
}

export function extractImpersonationTokenFromUrl(rawUrl?: string): string | null {
  if (typeof window === 'undefined' && !rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl || window.location.href);
    const token = url.searchParams.get(IMPERSONATION_QUERY_PARAM);
    return token ? token.trim() : null;
  } catch {
    return null;
  }
}

export function stripImpersonationTokenFromUrl(rawUrl?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const url = new URL(rawUrl || window.location.href);
    if (!url.searchParams.has(IMPERSONATION_QUERY_PARAM)) {
      return;
    }

    url.searchParams.delete(IMPERSONATION_QUERY_PARAM);
    const newUrl = `${url.origin}${url.pathname}${
      url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
    }${url.hash}`;

    window.history.replaceState({}, document.title, newUrl);
  } catch {
    // Если что-то пошло не так, не трогаем историю
  }
}
