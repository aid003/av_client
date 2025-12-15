'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { CheckSquare, XSquare } from 'lucide-react';
import { SelectionCounter } from './SelectionCounter';
import type { SelectionMode } from '../model/use-selection';

interface SelectionToolbarProps {
  selectionMode: SelectionMode;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function SelectionToolbar({
  selectionMode,
  selectedCount,
  onSelectAll,
  onClearSelection,
  disabled = false,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          disabled={disabled || selectionMode === 'all'}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Выбрать все
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={disabled || !hasSelection}
        >
          <XSquare className="h-4 w-4 mr-2" />
          Очистить
        </Button>
      </div>

      <SelectionCounter count={selectedCount} mode={selectionMode} />
    </div>
  );
}
