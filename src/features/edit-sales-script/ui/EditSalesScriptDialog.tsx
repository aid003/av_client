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
import { Input } from '@/shared/ui/components/ui/input';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  updateSalesScript,
  useSalesScriptsActions,
  type SalesScript,
} from '@/entities/sales-script';

interface EditSalesScriptDialogProps {
  script: SalesScript | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSalesScriptDialog({
  script,
  tenantId,
  open,
  onOpenChange,
}: EditSalesScriptDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateSalesScript: updateScriptInStore } = useSalesScriptsActions();

  useEffect(() => {
    if (script && open) {
      setName(script.name);
      setDescription(script.description || '');
      setIsActive(script.isActive);
      setError(null);
    }
  }, [script, open]);

  const handleUpdate = async () => {
    if (!script) return;

    if (!name.trim()) {
      setError('Пожалуйста, введите название скрипта');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedScript = await updateSalesScript(script.id, tenantId, {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
      });

      updateScriptInStore(tenantId, updatedScript);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при обновлении скрипта'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать скрипт продаж</DialogTitle>
          <DialogDescription>
            Измените название, описание или статус скрипта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-script-name">Название</Label>
            <Input
              id="edit-script-name"
              placeholder="Например: Основной скрипт продаж"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading && name.trim()) {
                  handleUpdate();
                }
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-script-description">
              Описание (опционально)
            </Label>
            <Textarea
              id="edit-script-description"
              placeholder="Краткое описание скрипта"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-script-active">Активен</Label>
            <Switch
              id="edit-script-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
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
            onClick={handleUpdate}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
