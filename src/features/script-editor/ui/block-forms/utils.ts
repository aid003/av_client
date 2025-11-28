import type { ScriptBlockType } from '@/entities/sales-script';

export function getBlockTypeLabel(type: ScriptBlockType): string {
  switch (type) {
    case 'START':
      return 'Старт';
    case 'MESSAGE':
      return 'Сообщение';
    case 'QUESTION':
      return 'Вопрос';
    case 'ROUTER':
      return 'Разветвление';
    case 'LLM_REPLY':
      return 'Ответ ИИ';
    case 'END':
      return 'Конец';
    default:
      return 'Блок';
  }
}
