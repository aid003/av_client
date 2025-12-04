/**
 * Safely get a string value from slots
 */
export function getSlotString(
  slots: Record<string, unknown> | undefined,
  key: string,
  fallback: string = '—'
): string {
  if (!slots || !(key in slots)) return fallback;
  const value = slots[key];
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/**
 * Safely get a number value from slots
 */
export function getSlotNumber(
  slots: Record<string, unknown> | undefined,
  key: string,
  fallback?: number
): number | undefined {
  if (!slots || !(key in slots)) return fallback;
  const value = slots[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Format currency value from slots
 */
export function formatSlotCurrency(
  slots: Record<string, unknown> | undefined,
  key: string,
  locale: string = 'ru-RU',
  currency: string = '₽'
): string | null {
  const value = getSlotNumber(slots, key);
  if (value === undefined) return null;
  return `${value.toLocaleString(locale)} ${currency}`;
}

/**
 * Get phone from slots with formatting
 */
export function getSlotPhone(
  slots: Record<string, unknown> | undefined,
  key: string = 'phone'
): string | null {
  const phone = getSlotString(slots, key, '');
  return phone || null;
}

/**
 * Get all slot entries for dynamic rendering
 */
export function getSlotEntries(
  slots: Record<string, unknown> | undefined
): Array<{ key: string; value: unknown }> {
  if (!slots) return [];
  return Object.entries(slots).map(([key, value]) => ({ key, value }));
}

/**
 * Format slot value for display
 */
export function formatSlotValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (typeof value === 'number') return value.toLocaleString('ru-RU');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Get human-readable slot key name (can be enhanced with mapping)
 */
export function getSlotLabel(key: string): string {
  const labels: Record<string, string> = {
    phone: 'Телефон',
    budget: 'Бюджет',
    status: 'Статус',
    email: 'Email',
    address: 'Адрес',
    city: 'Город',
    source: 'Источник',
    deliveryType: 'Тип доставки',
    isCompany: 'Компания',
    additionalNotes: 'Дополнительные заметки',
  };
  return labels[key] || key;
}
