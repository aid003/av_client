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
import { AlertTriangle } from 'lucide-react';
import {
  deleteSalesScript,
  useSalesScriptsActions,
  type SalesScript,
} from '@/entities/sales-script';

interface DeleteSalesScriptDialogProps {
  script: SalesScript | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSalesScriptDialog({
  script,
  tenantId,
  open,
  onOpenChange,
}: DeleteSalesScriptDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { removeSalesScript } = useSalesScriptsActions();

  const handleDelete = async () => {
    if (!script) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteSalesScript(script.id, tenantId);
      removeSalesScript(tenantId, script.id);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при удалении скрипта'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить скрипт продаж?</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить скрипт &quot;{script?.name}&quot;?
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Скрипт будет безвозвратно удален вместе со всеми привязками к
              объявлениям
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mt-4">
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
