'use client';

import { type DragEvent } from 'react';
import {
  Play,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Sparkles,
  Square,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptBlockType } from '@/entities/sales-script';

interface BlockTypeItem {
  type: ScriptBlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  disabled?: boolean;
}

const BLOCK_TYPES: BlockTypeItem[] = [
  {
    type: 'START',
    label: 'Старт',
    description: 'Точка входа',
    icon: <Play className="w-4 h-4" />,
    iconBgColor: 'bg-green-500',
    disabled: true, // Только один старт
  },
  {
    type: 'MESSAGE',
    label: 'Сообщение',
    description: 'Отправить текст',
    icon: <MessageSquare className="w-4 h-4" />,
    iconBgColor: 'bg-blue-500',
  },
  {
    type: 'QUESTION',
    label: 'Вопрос',
    description: 'Спросить клиента',
    icon: <HelpCircle className="w-4 h-4" />,
    iconBgColor: 'bg-amber-500',
  },
  {
    type: 'ROUTER',
    label: 'Разветвление',
    description: 'Да / Нет / Другое',
    icon: <GitBranch className="w-4 h-4" />,
    iconBgColor: 'bg-purple-500',
  },
  {
    type: 'LLM_REPLY',
    label: 'Ответ ИИ',
    description: 'Нейросеть формирует ответ',
    icon: <Sparkles className="w-4 h-4" />,
    iconBgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  {
    type: 'END',
    label: 'Конец',
    description: 'Завершение скрипта',
    icon: <Square className="w-4 h-4" />,
    iconBgColor: 'bg-red-500',
  },
];

interface BlocksPaletteProps {
  hasStartBlock?: boolean;
}

export function BlocksPalette({ hasStartBlock = false }: BlocksPaletteProps) {
  const onDragStart = (event: DragEvent, type: ScriptBlockType) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Блоки
      </h3>
      <div className="space-y-1.5">
        {BLOCK_TYPES.map((block) => {
          const isDisabled = block.disabled || (block.type === 'START' && hasStartBlock);

          return (
            <div
              key={block.type}
              draggable={!isDisabled}
              onDragStart={(e) => onDragStart(e, block.type)}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border cursor-grab transition-all',
                'hover:bg-muted/50 hover:border-primary/50',
                'active:cursor-grabbing',
                isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-border'
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white',
                  block.iconBgColor
                )}
              >
                {block.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{block.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {block.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Перетащите блок на канвас, чтобы добавить его в скрипт
        </p>
      </div>
    </div>
  );
}

