'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Separator } from '@/shared/ui/components/ui/separator';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import {
  usePopoverState,
  useScriptEditorSlots,
  useScriptEditorActions,
  useScriptEditorStore,
} from '../model/store';
import {
  MessageBlockForm,
  QuestionBlockForm,
  RouterBlockForm,
  LLMReplyBlockForm,
  EndBlockForm,
  getBlockTypeLabel,
} from './block-forms';
import type {
  MessageBlockConfig,
  QuestionBlockConfig,
  RouterBlockConfig,
  LLMReplyBlockConfig,
  EndBlockConfig,
} from '@/entities/sales-script';

export function BlockEditPopover() {
  const popover = usePopoverState();
  const slots = useScriptEditorSlots();
  const {
    closePopover,
    updateNodeData,
    deleteNode,
  } = useScriptEditorActions();

  const selectedNode = useScriptEditorStore((state) => {
    if (!state.popover.nodeId) return null;
    return state.nodes.find(n => n.id === state.popover.nodeId) || null;
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне popover
  useEffect(() => {
    if (!popover.isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Игнорируем клики внутри диалогов и Radix UI popup-элементов
      if (
        target.closest('[role="dialog"]') ||
        target.closest('[data-radix-popper-content-wrapper]') ||
        target.closest('[data-radix-select-content]') ||
        target.closest('[data-radix-dropdown-menu-content]') ||
        target.closest('[data-radix-popover-content]')
      ) {
        return;
      }

      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    // Добавляем слушатель с небольшой задержкой, чтобы не закрыть сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popover.isOpen, closePopover]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    if (!popover.isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [popover.isOpen, closePopover]);

  // Корректировка позиции при выходе за границы viewport
  useEffect(() => {
    if (!popover.isOpen || !popoverRef.current || !popover.anchorPosition) return;

    const anchorPosition = popover.anchorPosition;

    // Небольшая задержка для получения размеров после рендера
    const timer = setTimeout(() => {
      if (!popoverRef.current) return;

      const rect = popoverRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let adjustedX = anchorPosition.x;
      let adjustedY = anchorPosition.y;

      // Проверка вертикального переполнения
      if (rect.bottom > viewportHeight) {
        // Попап выходит за нижнюю границу
        adjustedY = Math.max(20, viewportHeight - rect.height - 20);
      }

      // Проверка горизонтального переполнения
      if (rect.right > viewportWidth) {
        // Попап выходит за правую границу, сдвигаем влево
        adjustedX = Math.max(20, viewportWidth - rect.width - 20);
      }

      // Применяем корректировки если нужно
      if (adjustedX !== anchorPosition.x || adjustedY !== anchorPosition.y) {
        popoverRef.current.style.left = `${adjustedX}px`;
        popoverRef.current.style.top = `${adjustedY}px`;
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [popover.isOpen, popover.anchorPosition]);

  // Закрывать попап при изменении размера окна
  useEffect(() => {
    if (!popover.isOpen) return;

    const handleResize = () => {
      closePopover();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [popover.isOpen, closePopover]);

  if (!popover.isOpen || !selectedNode || !popover.anchorPosition) {
    return null;
  }

  const blockType = selectedNode.data.blockType;
  const isStartNode = blockType === 'START';

  const handleUpdate = (data: Partial<typeof selectedNode.data>) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, data);
  };

  const handleConfigUpdate = useCallback((configUpdates: Partial<any>) => {
    if (!selectedNode) return;

    updateNodeData(selectedNode.id, {
      config: { ...selectedNode.data.config, ...configUpdates }
    });
  }, [selectedNode, updateNodeData]);

  const handleDelete = () => {
    deleteNode(selectedNode.id);
    closePopover();
  };

  // Вычисляем позицию popover
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${popover.anchorPosition.x}px`,
    top: `${popover.anchorPosition.y}px`,
    zIndex: 50,
  };

  const content = (
    <div
      ref={popoverRef}
      style={style}
      className="w-[380px] bg-popover text-popover-foreground rounded-lg border shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">
          {getBlockTypeLabel(blockType)}
        </h3>
        <div className="flex items-center gap-1">
          {!isStartNode && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              title="Удалить блок"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closePopover}
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="max-h-[60vh] overflow-auto">
        <div className="p-4 space-y-4">
          {/* Название блока */}
          <div className="space-y-2">
            <Label htmlFor="block-title">Название</Label>
            <Input
              id="block-title"
              value={selectedNode.data.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Название блока"
            />
          </div>

          <Separator />

          {/* Форма в зависимости от типа блока */}
          {blockType === 'MESSAGE' && (
            <MessageBlockForm
              config={selectedNode.data.config as MessageBlockConfig}
              onUpdate={handleConfigUpdate}
            />
          )}

          {blockType === 'QUESTION' && (
            <QuestionBlockForm
              config={selectedNode.data.config as QuestionBlockConfig}
              slots={slots}
              onUpdate={handleConfigUpdate}
            />
          )}

          {blockType === 'ROUTER' && (
            <RouterBlockForm
              config={selectedNode.data.config as RouterBlockConfig}
              onUpdate={handleConfigUpdate}
            />
          )}

          {blockType === 'LLM_REPLY' && (
            <LLMReplyBlockForm
              config={selectedNode.data.config as LLMReplyBlockConfig}
              onUpdate={handleConfigUpdate}
            />
          )}

          {blockType === 'END' && (
            <EndBlockForm
              config={selectedNode.data.config as EndBlockConfig}
              onUpdate={handleConfigUpdate}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(content, document.body) : null;
}
