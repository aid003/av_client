'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/shared/ui/components/ui/input';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Label } from '@/shared/ui/components/ui/label';
import { X } from 'lucide-react';
import type { NotificationType } from '@/entities/notification';

interface NotificationFiltersProps {
  filters: {
    type?: NotificationType;
    unreadOnly?: boolean;
    activeOnly?: boolean;
    search?: string;
  };
  onFiltersChange: (filters: {
    type?: NotificationType;
    unreadOnly?: boolean;
    activeOnly?: boolean;
    search?: string;
  }) => void;
  onReset: () => void;
}

export function NotificationFilters({
  filters,
  onFiltersChange,
  onReset,
}: NotificationFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as NotificationType),
    });
  };

  const handleUnreadOnlyChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      unreadOnly: checked || undefined,
    });
  };

  const handleActiveOnlyChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      activeOnly: checked || undefined,
    });
  };

  const hasActiveFilters =
    filters.type || filters.unreadOnly || filters.activeOnly || filters.search;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Фильтры</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Поиск */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <Input
            id="search"
            type="text"
            placeholder="Поиск по заголовку или сообщению..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Тип уведомления */}
        <div className="space-y-2">
          <Label htmlFor="type">Тип</Label>
          <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Все типы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="INFO">Информация</SelectItem>
              <SelectItem value="WARNING">Предупреждение</SelectItem>
              <SelectItem value="ERROR">Ошибка</SelectItem>
              <SelectItem value="SUCCESS">Успех</SelectItem>
              <SelectItem value="SYSTEM">Система</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Только непрочитанные */}
        <div className="space-y-2">
          <Label htmlFor="unreadOnly">Статус</Label>
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="unreadOnly"
              type="checkbox"
              checked={filters.unreadOnly || false}
              onChange={(e) => handleUnreadOnlyChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="unreadOnly" className="font-normal cursor-pointer">
              Только непрочитанные
            </Label>
          </div>
        </div>

        {/* Только активные */}
        <div className="space-y-2">
          <Label htmlFor="activeOnly">Активность</Label>
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="activeOnly"
              type="checkbox"
              checked={filters.activeOnly || false}
              onChange={(e) => handleActiveOnlyChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="activeOnly" className="font-normal cursor-pointer">
              Только активные
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}

