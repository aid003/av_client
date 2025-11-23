'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import {
  deleteChunk,
  deleteChunksBatch,
  type KnowledgeBase,
  type Chunk,
} from '@/entities/knowledge-base';

interface DeleteChunksConfirmDialogProps {
  chunks: Chunk[];
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteChunksConfirmDialog({
  chunks,
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteChunksConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMultiple = chunks.length > 1;

  const handleDelete = async () => {
    if (!knowledgeBase || chunks.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isMultiple) {
        // Пакетное удаление
        await deleteChunksBatch(knowledgeBase.id, tenantId, {
          chunkIds: chunks.map((c) => c.id),
        });
      } else {
        // Удаление одного чанка
        await deleteChunk(knowledgeBase.id, chunks[0].id, tenantId);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при удалении чанков'
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Подтверждение удаления
          </DialogTitle>
          <DialogDescription>
            {isMultiple
              ? `Вы действительно хотите удалить ${chunks.length} чанков?`
              : 'Вы действительно хотите удалить этот чанк?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Это действие необратимо. Удалённые чанки невозможно будет
              восстановить.
            </AlertDescription>
          </Alert>

          {!isMultiple && chunks[0] && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm line-clamp-3">{chunks[0].text}</p>
            </div>
          )}

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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
