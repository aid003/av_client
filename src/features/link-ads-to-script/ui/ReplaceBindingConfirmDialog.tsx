'use client';

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
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { AlertTriangle, FileText } from 'lucide-react';
import type { SalesScript, ScriptBinding } from '@/entities/sales-script';

interface ConflictInfo {
  adId: string;
  adTitle: string;
  existingBinding: ScriptBinding;
}

interface ReplaceBindingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictInfo[];
  newScript: SalesScript | null;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ReplaceBindingConfirmDialog({
  open,
  onOpenChange,
  conflicts,
  newScript,
  onConfirm,
  isProcessing,
}: ReplaceBindingConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Заменить существующие привязки?
          </DialogTitle>
          <DialogDescription>
            Следующие объявления уже имеют привязанные скрипты, которые будут заменены
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Новый скрипт: <strong>{newScript?.name}</strong>
              <br />
              <span className="text-xs text-muted-foreground">
                Каждое объявление может иметь только один активный скрипт
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Объявлений с конфликтами: {conflicts.length}
            </div>

            <ScrollArea className="h-[240px] rounded-md border">
              <div className="p-3 space-y-2">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.adId}
                    className="p-3 rounded-md bg-muted/50 border space-y-1"
                  >
                    <div className="font-medium text-sm">
                      {conflict.adTitle}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>
                        Текущий скрипт:{' '}
                        <span className="font-medium text-foreground">
                          {conflict.existingBinding.salesScriptName}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              При подтверждении старые привязки будут удалены и заменены новыми.
              Это действие необратимо.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Замена...' : 'Заменить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
