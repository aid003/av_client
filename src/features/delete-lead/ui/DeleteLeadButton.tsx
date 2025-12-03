'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/components/ui/dialog';
import { deleteLead, useLeadsActions, type Lead } from '@/entities/lead';

interface DeleteLeadButtonProps {
  lead: Lead;
  tenantId: string;
  onDeleted?: () => void;
}

export function DeleteLeadButton({
  lead,
  tenantId,
  onDeleted,
}: DeleteLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { removeLead } = useLeadsActions();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteLead(tenantId, lead.id);
      removeLead(tenantId, lead.id);
      setIsOpen(false);
      onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении лида');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить лид?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить лид{' '}
              <span className="font-semibold">
                {lead.clientName || 'Без имени'}
              </span>
              ? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
