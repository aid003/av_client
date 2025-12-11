'use client';

import { Settings, RotateCcw } from 'lucide-react';
import type { Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/ui/components/ui/dropdown-menu';
import { Button } from '@/shared/ui/components/ui/button';
import { useColumnSettings, useColumnSettingsActions } from '../model/store';
import { COLUMN_LABELS } from '../lib/default-columns';
import type { AvitoAd } from '@/entities/avito-ad';

interface ColumnSettingsDropdownProps {
  table: Table<AvitoAd>;
  tenantId: string;
}

export function ColumnSettingsDropdown({
  table,
  tenantId,
}: ColumnSettingsDropdownProps) {
  const settings = useColumnSettings(tenantId);
  const { updateSettings, resetSettings } = useColumnSettingsActions();

  const handleToggleColumn = (columnId: string, isVisible: boolean) => {
    const newVisibility = {
      ...settings.visibility,
      [columnId]: isVisible,
    };
    updateSettings(tenantId, { visibility: newVisibility });
    // Removed direct table update - controlled state handles it
  };

  const handleResetSettings = () => {
    resetSettings(tenantId);
    // Removed direct table updates - controlled state handles it
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Колонки
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Видимые колонки</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table.getAllLeafColumns().map((column) => {
          const label = COLUMN_LABELS[column.id] || column.id;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => handleToggleColumn(column.id, !!value)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          onSelect={handleResetSettings}
          className="justify-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Сбросить настройки
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
