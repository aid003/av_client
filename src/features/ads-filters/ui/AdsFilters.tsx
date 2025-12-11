'use client';

import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Button } from '@/shared/ui/components/ui/button';
import { useAdsFilters, useAdsFiltersActions } from '../model/store';

interface AdsFiltersProps {
  tenantId: string;
}

export function AdsFilters({ tenantId }: AdsFiltersProps) {
  const filters = useAdsFilters(tenantId);
  const { setFilters, clearFilters } = useAdsFiltersActions();

  const handleStatusChange = (value: string) => {
    setFilters(tenantId, {
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    clearFilters(tenantId);
  };

  const hasActiveFilters = filters.status || filters.categoryId || filters.search;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Статус</label>
            <Select
              value={filters.status || 'ACTIVE'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Активные</SelectItem>
                <SelectItem value="REMOVED">Удаленные</SelectItem>
                <SelectItem value="OLD">Завершенные</SelectItem>
                <SelectItem value="BLOCKED">Заблокированные</SelectItem>
                <SelectItem value="REJECTED">Отклоненные</SelectItem>
                <SelectItem value="NOT_FOUND">Не найдено</SelectItem>
                <SelectItem value="all">Все статусы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TODO: Category Filter - requires categories API */}
          {/* <div>
            <label className="text-sm font-medium mb-1.5 block">Категория</label>
            <Select
              value={filters.categoryId?.toString() || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            title="Сбросить фильтры"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
