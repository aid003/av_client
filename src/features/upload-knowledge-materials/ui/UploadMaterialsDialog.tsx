'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Label } from '@/shared/ui/components/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileText,
} from 'lucide-react';
import { postEvent, on, type EventListener } from '@tma.js/sdk';
import {
  uploadText,
  getChunks,
  type KnowledgeBase,
} from '@/entities/knowledge-base';

interface UploadMaterialsDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChunks?: () => void;
}

export function UploadMaterialsDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
  onViewChunks,
}: UploadMaterialsDialogProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [currentChunksCount, setCurrentChunksCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Загрузка текущего количества чанков при открытии диалога
  useEffect(() => {
    if (open && knowledgeBase) {
      loadChunksCount();
    }
  }, [open, knowledgeBase]);

  const loadChunksCount = async () => {
    if (!knowledgeBase || !knowledgeBase.id) {
      return;
    }

    // Валидация CUID формата
    const cuidPattern = /^c[a-z0-9]{24}$/;
    if (!cuidPattern.test(knowledgeBase.id) || !cuidPattern.test(tenantId)) {
      return;
    }

    setIsLoadingCount(true);

    try {
      // Запрашиваем первую страницу с 1 элементом только для получения total
      const response = await getChunks(knowledgeBase.id, tenantId, 1, 1);
      setCurrentChunksCount(response.meta.total);
    } catch (err) {
      console.error('Ошибка при загрузке количества чанков:', err);
      setCurrentChunksCount(null);
    } finally {
      setIsLoadingCount(false);
    }
  };

  const handleUpload = async () => {
    if (!knowledgeBase || !text.trim()) {
      setUploadError('Пожалуйста, введите текст для загрузки');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await uploadText(knowledgeBase.id, tenantId, {
        text: text.trim(),
      });

      setUploadSuccess(
        `Успешно загружено! Создано чанков: ${response.totalChunks}`
      );
      setText('');

      // Обновляем счетчик чанков
      await loadChunksCount();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Ошибка при загрузке текста'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteFromClipboard = () => {
    try {
      // Генерируем уникальный ID запроса
      const reqId = `clipboard_${Date.now()}_${Math.random()}`;
      
      // Создаем обработчик события
      const handleClipboardEvent: EventListener<'clipboard_text_received'> = (event) => {
        if (event.req_id === reqId) {
          if (event.data !== null && event.data !== '') {
            setText((prev) => prev + event.data);
            setUploadError(null);
          } else {
            setUploadError('Буфер обмена пуст или доступ запрещен');
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
      setUploadError('Не удалось прочитать буфер обмена');
    }
  };

  const handleViewChunks = () => {
    onOpenChange(false);
    onViewChunks?.();
  };

  const resetState = () => {
    setText('');
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {knowledgeBase?.name} - Загрузить материалы
          </DialogTitle>
          <DialogDescription>
            {isLoadingCount ? (
              'Загрузка информации...'
            ) : currentChunksCount !== null ? (
              `База знаний содержит ${currentChunksCount} ${
                currentChunksCount === 1
                  ? 'чанк'
                  : currentChunksCount < 5
                  ? 'чанка'
                  : 'чанков'
              }`
            ) : (
              'Загрузите текст, который будет разбит на чанки и добавлен в базу знаний'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="upload-text">Текст для загрузки</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
                disabled={isUploading}
                className="h-8"
              >
                <Clipboard className="h-3.5 w-3.5 mr-2" />
                Вставить из буфера обмена
              </Button>
            </div>
            <Textarea
              id="upload-text"
              placeholder="Вставьте или введите текст, который будет разбит на чанки и добавлен в базу знаний..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isUploading}
              rows={15}
              className="resize-none"
            />
          </div>

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 flex items-center justify-between">
                <span>{uploadSuccess}</span>
                {onViewChunks && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewChunks}
                    className="ml-4 h-8 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    <FileText className="h-3.5 w-3.5 mr-2" />
                    Просмотреть чанки
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={isUploading || !text.trim()}
            className="w-full"
          >
            {isUploading ? 'Загрузка...' : 'Загрузить текст'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
