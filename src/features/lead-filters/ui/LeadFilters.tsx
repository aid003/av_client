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
    <div className="bg-card border rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="font-semibold text-sm sm:text-base">Фильтры</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="shrink-0">
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Сбросить</span>
            <span className="sm:hidden">Сброс</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Завершенность</Label>
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Все" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="yes">Завершенные</SelectItem>
              <SelectItem value="no">Незавершенные</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Скрипт</Label>
          <Select
            value={filters.scriptId || 'all'}
            onValueChange={(v) =>
              handleFilterChange('scriptId', v === 'all' ? undefined : v)
            }
          >
            <SelectTrigger className="w-full">
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
