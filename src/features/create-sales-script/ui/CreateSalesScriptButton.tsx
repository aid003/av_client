'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface CreateSalesScriptButtonProps {
  tenantId: string;
}

export function CreateSalesScriptButton({
  tenantId,
}: CreateSalesScriptButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsActive(true);
    setError(null);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Пожалуйста, введите название скрипта');
      return;
    }

    setError(null);

    // Сохраняем данные нового скрипта в localStorage
    const newScriptData = {
      name: name.trim(),
      description: description.trim() || undefined,
      isActive,
      tenantId,
    };

    localStorage.setItem('newScriptData', JSON.stringify(newScriptData));

    // Закрываем диалог и переходим в редактор
    setIsOpen(false);
    router.push('/sales-scripts/new');
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
                  if (e.key === 'Enter' && name.trim()) {
                    handleCreate();
                  }
                }}
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
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="script-active">Активен</Label>
              <Switch
                id="script-active"
                checked={isActive}
                onCheckedChange={setIsActive}
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
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Перейти к созданию графа
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
