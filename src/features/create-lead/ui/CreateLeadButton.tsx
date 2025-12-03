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
  type LeadStatus,
} from '@/entities/lead';
import { useSalesScriptsForTenant } from '@/entities/sales-script';

interface CreateLeadButtonProps {
  tenantId: string;
}

export function CreateLeadButton({ tenantId }: CreateLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');

  const { addLead } = useLeadsActions();
  const scripts = useSalesScriptsForTenant(tenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const lead = await createLead(tenantId, {
        clientName: clientName || undefined,
        phone: phone || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        scriptId: scriptId || undefined,
        status,
        source: 'MANUAL',
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
    setClientName('');
    setPhone('');
    setBudget('');
    setScriptId('');
    setStatus('NEW');
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
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
