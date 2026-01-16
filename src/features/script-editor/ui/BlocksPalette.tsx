'use client';

import { type DragEvent } from 'react';
import {
  Play,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Sparkles,
  Square,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/components/ui/button';
import { useScriptEditorActions } from '../model/store';
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
    type: 'MULTI_ROUTER',
    label: 'Мульти-ветвление',
    description: 'Выбор из списка',
    icon: <GitBranch className="w-4 h-4" />,
    iconBgColor: 'bg-indigo-500',
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

const BLOCK_GROUPS: Array<{ title: string; types: ScriptBlockType[] }> = [
  {
    title: 'Блоки начала',
    types: ['START'],
  },
  {
    title: 'Блоки диалога',
    types: ['MESSAGE', 'QUESTION', 'LLM_REPLY'],
  },
  {
    title: 'Блоки логики',
    types: ['ROUTER', 'MULTI_ROUTER'],
  },
  {
    title: 'Блоки завершения',
    types: ['END'],
  },
];

interface BlocksPaletteProps {
  hasStartBlock?: boolean;
  isCollapsed?: boolean;
}

export function BlocksPalette({ hasStartBlock = false, isCollapsed = false }: BlocksPaletteProps) {
  const { togglePaletteCollapse } = useScriptEditorActions();
  const blockTypeMap = new Map(BLOCK_TYPES.map((block) => [block.type, block]));

  const onDragStart = (event: DragEvent, type: ScriptBlockType) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with toggle button */}
      <div className={cn(
        "flex items-center border-b",
        isCollapsed ? "p-2 justify-center" : "p-3 justify-between"
      )}>
        {!isCollapsed && (
          <h3 className="text-sm font-semibold text-muted-foreground">
            Блоки
          </h3>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={togglePaletteCollapse}
          title={isCollapsed ? "Развернуть" : "Свернуть"}
          className={!isCollapsed ? "ml-auto" : ""}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Blocks list */}
      <div className={cn(
        "p-3 space-y-4 overflow-y-auto",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {BLOCK_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1.5">
            {!isCollapsed && (
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                {group.title}
              </div>
            )}
            {group.types.map((type) => {
              const block = blockTypeMap.get(type);
              if (!block) return null;

              const isDisabled = block.disabled || (block.type === 'START' && hasStartBlock);

              return (
                <div
                  key={block.type}
                  draggable={!isDisabled}
                  onDragStart={(e) => onDragStart(e, block.type)}
                  title={isCollapsed ? `${block.label} - ${block.description}` : undefined}
                  className={cn(
                    'flex items-center rounded-lg border cursor-grab transition-all',
                    'hover:bg-muted/50 hover:border-primary/50',
                    'active:cursor-grabbing',
                    isCollapsed ? 'p-2 justify-center' : 'gap-3 p-2.5',
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

                  {/* Text - only show when expanded */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{block.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {block.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Helper text - only show when expanded */}
      {!isCollapsed && (
        <div className="p-4 mt-auto border-t">
          <p className="text-xs text-muted-foreground">
            Перетащите блок на канвас, чтобы добавить его в скрипт
          </p>
        </div>
      )}
    </div>
  );
}
