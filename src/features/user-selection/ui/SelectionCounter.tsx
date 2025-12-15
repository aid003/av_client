'use client';

import { Badge } from '@/shared/ui/components/ui/badge';
import { Users } from 'lucide-react';
import type { SelectionMode } from '../model/use-selection';

interface SelectionCounterProps {
  count: number;
  mode: SelectionMode;
}

export function SelectionCounter({ count, mode }: SelectionCounterProps) {
  if (count === 0) {
    return (
      <Badge variant="secondary" className="font-normal">
        <Users className="h-3 w-3 mr-1" />
        Не выбрано
      </Badge>
    );
  }

  const label = mode === 'all' ? 'Все пользователи' : 'Выбрано';

  return (
    <Badge variant="default" className="font-medium">
      <Users className="h-3 w-3 mr-1" />
      {label}: {count}
    </Badge>
  );
}
