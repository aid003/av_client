'use client';

import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
  updateLead,
  useLeadsActions,
  type Lead,
} from '@/entities/lead';
import { useSalesScriptsForTenant } from '@/entities/sales-script';

interface EditLeadDialogProps {
  lead: Lead;
  tenantId: string;
}

export function EditLeadDialog({ lead, tenantId }: EditLeadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Record<string, unknown>>(lead.slots || {});
  const [scriptId] = useState(lead.scriptId || '');

  const { updateLead: updateLeadInStore } = useLeadsActions();
  const scripts = useSalesScriptsForTenant(tenantId);

  // Reset form when lead changes
  useEffect(() => {
    setSlots(lead.slots || {});
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const cleanedSlots = Object.entries(slots).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      const updatedLead = await updateLead(tenantId, lead.id, {
        slots: Object.keys(cleanedSlots).length > 0 ? cleanedSlots : undefined,
      });

      updateLeadInStore(tenantId, updatedLead);
      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при обновлении лида'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать лид</DialogTitle>
            <DialogDescription>
              Измените информацию о клиенте
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя клиента</Label>
              <Input
                value={lead.clientName || '—'}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Имя клиента устанавливается автоматически из чата
              </p>
            </div>

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
              <Label>Скрипт продаж</Label>
              <Select value={scriptId} disabled>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent>
                  {scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Скрипт нельзя изменить после создания лида
              </p>
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
