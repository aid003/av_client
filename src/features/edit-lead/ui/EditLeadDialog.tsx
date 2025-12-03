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
  type LeadStatus,
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

  const [clientName, setClientName] = useState(lead.clientName || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [budget, setBudget] = useState(lead.budget?.toString() || '');
  const [scriptId, setScriptId] = useState(lead.scriptId || '');
  const [status, setStatus] = useState<LeadStatus>(lead.status);

  const { updateLead: updateLeadInStore } = useLeadsActions();
  const scripts = useSalesScriptsForTenant(tenantId);

  // Reset form when lead changes
  useEffect(() => {
    setClientName(lead.clientName || '');
    setPhone(lead.phone || '');
    setBudget(lead.budget?.toString() || '');
    setScriptId(lead.scriptId || '');
    setStatus(lead.status);
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedLead = await updateLead(tenantId, lead.id, {
        clientName: clientName || undefined,
        phone: phone || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        status,
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
              <Label htmlFor="clientName">Имя клиента</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 900 123-45-67"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget">Бюджет (₽)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scriptId">Скрипт продаж</Label>
              <Select value={scriptId} onValueChange={setScriptId} disabled>
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

            <div className="grid gap-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as LeadStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Новый</SelectItem>
                  <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                  <SelectItem value="COMPLETED">Завершен</SelectItem>
                  <SelectItem value="LOST">Потерян</SelectItem>
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
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
