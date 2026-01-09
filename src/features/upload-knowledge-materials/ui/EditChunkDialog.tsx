'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertCircle, Clipboard } from 'lucide-react';
import { postEvent, on, type EventListener } from '@tma.js/sdk';
import {
  updateChunk,
  type KnowledgeBase,
  type Chunk,
} from '@/entities/knowledge-base';

interface EditChunkDialogProps {
  chunk: Chunk | null;
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditChunkDialog({
  chunk,
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
  onSuccess,
}: EditChunkDialogProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chunk) {
      setText(chunk.text);
    }
  }, [chunk]);

  const handlePasteFromClipboard = () => {
    try {
      // Генерируем уникальный ID запроса
      const reqId = `clipboard_${Date.now()}_${Math.random()}`;
      
      // Создаем обработчик события
      const handleClipboardEvent: EventListener<'clipboard_text_received'> = (event) => {
        if (event.req_id === reqId) {
          if (event.data !== null && event.data !== '') {
            setText((prev) => prev + event.data);
            setError(null);
          } else {
            setError('Буфер обмена пуст или доступ запрещен');
          }
          // Отписываемся от события после получения результата
          cleanup();
        }
      };
      
      // Подписываемся на событие
      const cleanup = on('clipboard_text_received', handleClipboardEvent);
      
      // Вызываем метод чтения буфера обмена
      postEvent('web_app_read_text_from_clipboard', { req_id: reqId });
      
      // Таймаут на случай, если событие не придет
      setTimeout(() => {
        cleanup();
      }, 5000);
    } catch (error) {
      console.error('Ошибка при чтении буфера обмена:', error);
      setError('Не удалось прочитать буфер обмена');
    }
  };

  const handleSave = async () => {
    if (!chunk || !knowledgeBase) return;

    if (!text.trim()) {
      setError('Текст чанка не может быть пустым');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateChunk(knowledgeBase.id, chunk.id, tenantId, {
        text: text.trim(),
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при обновлении чанка'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать чанк</DialogTitle>
          <DialogDescription>
            Измените текст чанка. Изменения будут сохранены в базе знаний.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="chunk-text">Текст</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
                disabled={isLoading}
                className="h-8"
              >
                <Clipboard className="h-3.5 w-3.5 mr-2" />
                Вставить из буфера обмена
              </Button>
            </div>
            <Textarea
              id="chunk-text"
              placeholder="Введите текст чанка"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              rows={12}
              className="resize-none font-mono text-sm"
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !text.trim()}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
