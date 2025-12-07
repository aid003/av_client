'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ClearStateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isClearing: boolean;
}

export function ClearStateDialog({
  open,
  onOpenChange,
  onConfirm,
  isClearing,
}: ClearStateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Подтверждение очистки
          </DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите очистить состояние выполнения этого скрипта?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Это действие удалит все состояния чатов и лиды, связанные с этим скриптом.
            Данное действие необратимо.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClearing}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Очистка...
              </>
            ) : (
              'Подтвердить очистку'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
