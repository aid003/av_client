'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import {
  createLead,
  useLeadsActions,
} from '@/entities/lead';
import { useSalesScriptsForTenant } from '@/entities/sales-script';

interface CreateLeadButtonProps {
  tenantId: string;
}

export function CreateLeadButton({ tenantId }: CreateLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scriptId, setScriptId] = useState('');
  const [slots, setSlots] = useState<Record<string, unknown>>({});

  const { addLead } = useLeadsActions();
  const scripts = useSalesScriptsForTenant(tenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Clean up empty slots
      const cleanedSlots = Object.entries(slots).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      const lead = await createLead(tenantId, {
        scriptId: scriptId || undefined,
        slots: Object.keys(cleanedSlots).length > 0 ? cleanedSlots : undefined,
      });

      addLead(tenantId, lead);
      setIsOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании лида');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setScriptId('');
    setSlots({});
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать лид
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать новый лид</DialogTitle>
            <DialogDescription>
              Введите информацию о клиенте
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={(slots.phone as string) || ''}
                onChange={(e) => setSlots({ ...slots, phone: e.target.value })}
                placeholder="+7 900 123-45-67"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget">Бюджет (₽)</Label>
              <Input
                id="budget"
                type="number"
                value={(slots.budget as string) || ''}
                onChange={(e) => setSlots({ ...slots, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="50000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scriptId">Скрипт продаж</Label>
              <Select value={scriptId} onValueChange={setScriptId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите скрипт" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
