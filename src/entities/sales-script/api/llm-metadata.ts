import { apiClient } from '@/shared/api';
import type { LlmMetadataResponse } from '../model/types';

/**
 * Mock данные для LLM metadata
 * TODO: Заменить на реальный API endpoint когда бэкенд будет готов
 */
const MOCK_LLM_METADATA: LlmMetadataResponse = {
  availableModels: [
    {
      id: 'gpt-4.1-mini',
      name: 'GPT‑4.1 Mini',
      provider: 'openai',
      description: 'Быстрая и недорогая модель для большинства задач.',
    },
    {
      id: 'gpt-4.1',
      name: 'GPT‑4.1',
      provider: 'openai',
      description: 'Более качественная модель для сложных диалогов.',
    },
    {
      id: 'gpt-4o',
      name: 'GPT‑4o',
      provider: 'openai',
      description: 'Флагманская модель общего назначения.',
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT‑4o Mini',
      provider: 'openai',
      description: 'Быстрая модель для классификации и NLU.',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT‑3.5 Turbo',
      provider: 'openai',
      description: 'Более старая модель, для экономных сценариев.',
    },
  ],
  availableOperations: [
    {
      id: 'generateReply',
      name: 'Генерация ответа',
      description: 'Формирование текста ответа клиенту (LLM_REPLY).',
      defaultModel: 'gpt-4.1-mini',
    },
    {
      id: 'classifyYesNoOther',
      name: 'Классификация YES/NO/OTHER',
      description: 'Роутер-ветвление по ответу клиента (ROUTER).',
      defaultModel: 'gpt-4o-mini',
    },
    {
      id: 'extractSlots',
      name: 'Извлечение слотов',
      description: 'Парсинг значений слотов из ответа клиента (QUESTION).',
      defaultModel: 'gpt-4o-mini',
    },
    {
      id: 'isAnswerRelevant',
      name: 'Релевантность ответа',
      description: 'Определение, отвечает ли клиент на вопрос.',
      defaultModel: 'gpt-4o-mini',
    },
    {
      id: 'rephraseQuestion',
      name: 'Переформулировка вопроса',
      description: 'Переспрашивание вопроса с мини-отработкой возражения.',
      defaultModel: 'gpt-4.1-mini',
    },
    {
      id: 'normalizeSlotValue',
      name: 'Нормализация значения слота',
      description: 'Приведение значения к нужному типу.',
      defaultModel: 'gpt-4o-mini',
    },
  ],
  promptTemplates: {
    generateReply: {
      default:
        'Вы — вежливый и профессиональный ассистент по продажам. Отвечайте ТОЛЬКО на русском языке, в деловом, но дружелюбном тоне. Используйте историю диалога, слоты и базу знаний, но не упоминайте их явно.',
      description: 'Базовый системный промпт для генерации ответа.',
    },
    classifyYesNoOther: {
      default:
        'Ты помощник по продажам. Твоя задача — классифицировать ответ клиента как YES, NO или OTHER. Отвечай одним словом: YES, NO или OTHER.',
      description: 'Системный промпт для классификации YES/NO/OTHER.',
    },
    extractSlots: {
      default:
        'Ты помощник по продажам. Твоя задача — извлечь значение слота из ответа клиента и вернуть JSON.',
      description: 'Промпт для извлечения значений слотов.',
    },
    isAnswerRelevant: {
      default:
        'Ты помощник по продажам. Твоя задача — определить, отвечает ли клиент на заданный вопрос.',
      description: 'Промпт для проверки релевантности ответа.',
    },
    rephraseQuestion: {
      default:
        'Ты вежливый и профессиональный ассистент по продажам. Клиент не ответил на вопрос или дал нерелевантный ответ. Сформируй одно сообщение с мини-отработкой и новой формулировкой вопроса.',
      description: 'Промпт для переформулировки вопроса.',
    },
    normalizeSlotValue: {
      default:
        'Ты помощник по нормализации данных. Твоя задача — нормализовать значение слота и вернуть JSON.',
      description: 'Промпт для нормализации значений слотов.',
    },
  },
};

// Кэш метаданных для избежания повторных запросов
let metadataCache: LlmMetadataResponse | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

/**
 * Получить метаданные LLM (доступные модели, операции, промпты)
 * 
 * Использует кэширование для оптимизации повторных запросов.
 * При недоступности API возвращает mock данные как fallback.
 */
export async function getLlmMetadata(forceRefresh = false): Promise<LlmMetadataResponse> {
  // Проверяем кэш, если не требуется принудительное обновление
  if (!forceRefresh && metadataCache && cacheTimestamp) {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION) {
      return Promise.resolve(metadataCache);
    }
  }

  try {
    // Пытаемся получить с бэкенда
    const response = await apiClient.get<LlmMetadataResponse>('/api/llm/metadata');
    
    // Проверяем валидность ответа
    if (!response || !response.availableModels || !Array.isArray(response.availableModels)) {
      throw new Error('Invalid response format from LLM metadata API');
    }

    // Сохраняем в кэш
    metadataCache = response;
    cacheTimestamp = Date.now();

    return response;
  } catch (error) {
    // Логируем ошибку для отладки
    if (error instanceof Error) {
      console.warn(
        `LLM metadata API not available (${error.message}), using mock data as fallback`
      );
    } else {
      console.warn(
        'LLM metadata API not available, using mock data as fallback:',
        error
      );
    }

    // Если в кэше есть данные, используем их
    if (metadataCache) {
      console.info('Using cached metadata due to API error');
      return Promise.resolve(metadataCache);
    }

    // Возвращаем mock данные как fallback
    return Promise.resolve(MOCK_LLM_METADATA);
  }
}

/**
 * Очистить кэш метаданных LLM
 */
export function clearLlmMetadataCache(): void {
  metadataCache = null;
  cacheTimestamp = null;
}
