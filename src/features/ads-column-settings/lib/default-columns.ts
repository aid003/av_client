import type { ColumnSettings } from '../model/types';

// Constant default settings for stable reference
export const DEFAULT_COLUMN_SETTINGS: ColumnSettings = {
  visibility: {
    itemId: true,
    title: true,
    status: true,
    price: true,
    category: true,
    knowledgeBases: true,
    script: true,
    address: false,
    url: false,
    startTime: false,
    finishTime: false,
    lastSyncedAt: false,
    createdAt: false,
  },
  order: [
    'itemId',
    'title',
    'status',
    'price',
    'category',
    'knowledgeBases',
    'script',
  ],
  sizes: {},
};

// Deprecated: Use DEFAULT_COLUMN_SETTINGS constant instead
export function getDefaultColumnSettings(): ColumnSettings {
  return DEFAULT_COLUMN_SETTINGS;
}

export const COLUMN_LABELS: Record<string, string> = {
  itemId: 'ID',
  title: 'Название',
  status: 'Статус',
  price: 'Цена',
  category: 'Категория',
  address: 'Адрес',
  url: 'Ссылка',
  knowledgeBases: 'Базы знаний',
  script: 'Скрипт продаж',
  startTime: 'Дата начала',
  finishTime: 'Дата окончания',
  lastSyncedAt: 'Синхронизация',
  createdAt: 'Создано',
};
