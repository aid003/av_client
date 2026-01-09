'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Trash2, X, XCircle } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkDismiss: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onBulkDelete,
  onBulkDismiss,
  onClearSelection,
  disabled = false,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-primary/5 border rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          Выбрано: <span className="text-primary">{selectedCount}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDismiss}
          disabled={disabled}
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Закрыть</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          disabled={disabled}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Удалить</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={disabled}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Снять выбор</span>
        </Button>
      </div>
    </div>
  );
}
