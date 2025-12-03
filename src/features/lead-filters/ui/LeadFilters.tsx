'use client';

import { Label } from '@/shared/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Button } from '@/shared/ui/components/ui/button';
import { X } from 'lucide-react';
import {
  useLeadFilters,
  useLeadsActions,
  type LeadFilters as Filters,
} from '@/entities/lead';
import { useSalesScriptsForTenant } from '@/entities/sales-script';

interface LeadFiltersProps {
  tenantId: string;
}

export function LeadFilters({ tenantId }: LeadFiltersProps) {
  const filters = useLeadFilters(tenantId);
  const { setFilters, clearFilters, loadLeads } = useLeadsActions();
  const scripts = useSalesScriptsForTenant(tenantId);

  const handleFilterChange = (
    key: keyof Filters,
    value: string | boolean | undefined
  ) => {
    const newFilters = { ...filters, [key]: value || undefined };
    // Remove undefined values
    Object.keys(newFilters).forEach(
      (k) =>
        newFilters[k as keyof Filters] === undefined &&
        delete newFilters[k as keyof Filters]
    );
    setFilters(tenantId, newFilters);
    loadLeads(tenantId, { page: 1 });
  };

  const handleClearFilters = () => {
    clearFilters(tenantId);
    loadLeads(tenantId, { page: 1 });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Фильтры</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Статус</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) =>
              handleFilterChange('status', v === 'all' ? undefined : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="NEW">Новый</SelectItem>
              <SelectItem value="IN_PROGRESS">В работе</SelectItem>
              <SelectItem value="COMPLETED">Завершен</SelectItem>
              <SelectItem value="LOST">Потерян</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Завершенность</Label>
          <Select
            value={
              filters.finished === undefined
                ? 'all'
                : filters.finished
                  ? 'yes'
                  : 'no'
            }
            onValueChange={(v) =>
              handleFilterChange(
                'finished',
                v === 'all' ? undefined : v === 'yes'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="yes">Завершенные</SelectItem>
              <SelectItem value="no">Незавершенные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Скрипт</Label>
          <Select
            value={filters.scriptId || 'all'}
            onValueChange={(v) =>
              handleFilterChange('scriptId', v === 'all' ? undefined : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              {scripts.map((script) => (
                <SelectItem key={script.id} value={script.id}>
                  {script.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
