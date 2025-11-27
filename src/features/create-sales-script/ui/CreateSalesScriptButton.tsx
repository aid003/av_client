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
import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Plus } from 'lucide-react';
import {
  createSalesScript,
  useSalesScriptsActions,
} from '@/entities/sales-script';
import { createEmptyDefinition } from '@/features/script-editor';

interface CreateSalesScriptButtonProps {
  tenantId: string;
}

export function CreateSalesScriptButton({
  tenantId,
}: CreateSalesScriptButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addSalesScript } = useSalesScriptsActions();

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsActive(true);
    setError(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Пожалуйста, введите название скрипта');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const definition = createEmptyDefinition(
        name.trim(),
        description.trim() || undefined
      );
      const newScript = await createSalesScript(tenantId, {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive,
        definition,
      });

      addSalesScript(tenantId, newScript);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при создании скрипта'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Создать скрипт
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать скрипт продаж</DialogTitle>
            <DialogDescription>
              Введите название и описание для нового скрипта
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="script-name">Название</Label>
              <Input
                id="script-name"
                placeholder="Например: Основной скрипт продаж"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && name.trim()) {
                    handleCreate();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="script-description">
                Описание (опционально)
              </Label>
              <Textarea
                id="script-description"
                placeholder="Краткое описание скрипта"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="script-active">Активен</Label>
              <Switch
                id="script-active"
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
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
