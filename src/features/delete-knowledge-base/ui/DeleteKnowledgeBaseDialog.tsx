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
import { AlertTriangle } from 'lucide-react';
import {
  deleteKnowledgeBase,
  useKnowledgeBasesActions,
  type KnowledgeBase,
} from '@/entities/knowledge-base';

interface DeleteKnowledgeBaseDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteKnowledgeBaseDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: DeleteKnowledgeBaseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { removeKnowledgeBase } = useKnowledgeBasesActions();

  const handleDelete = async () => {
    if (!knowledgeBase) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteKnowledgeBase(knowledgeBase.id, tenantId);
      removeKnowledgeBase(tenantId, knowledgeBase.id);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка при удалении базы знаний'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!knowledgeBase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Удалить базу знаний?
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <div>
                Вы уверены, что хотите удалить базу знаний{' '}
                <strong>{knowledgeBase.name}</strong>?
              </div>
              <div className="text-red-600 font-medium">
                Это действие необратимо. Все данные, включая чанки и векторные
                представления, будут удалены.
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
