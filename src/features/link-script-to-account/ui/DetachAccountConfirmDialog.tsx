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
import type { SalesScript, ScriptBinding } from '@/entities/sales-script';
import { useScriptBindingsActions } from '@/entities/sales-script';

interface DetachAccountConfirmDialogProps {
  script: SalesScript | null;
  binding: ScriptBinding | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetachAccountConfirmDialog({
  script,
  binding,
  tenantId,
  open,
  onOpenChange,
}: DetachAccountConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { detachFromAccount } = useScriptBindingsActions();

  const handleDetach = async () => {
    if (!script || !binding) return;

    setIsLoading(true);
    setError(null);

    try {
      await detachFromAccount(script.id, tenantId, binding.id);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при отвязке от аккаунта'
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
          <DialogTitle>Отвязать от аккаунта?</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите отвязать скрипт &quot;{script?.name}&quot; от
            аккаунта? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              После отвязки скрипт перестанет применяться к сообщениям на уровне
              аккаунта. Привязки к конкретным объявлениям не будут затронуты.
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
            onClick={handleDetach}
            disabled={isLoading}
          >
            {isLoading ? 'Отвязываю...' : 'Отвязать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

