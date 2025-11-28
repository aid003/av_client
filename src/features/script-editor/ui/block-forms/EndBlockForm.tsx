'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import type { EndBlockConfig } from '@/entities/sales-script';

interface EndBlockFormProps {
  config: EndBlockConfig;
  onUpdate: (config: Partial<EndBlockConfig>) => void;
}

export function EndBlockForm({ config, onUpdate }: EndBlockFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="end-reason">Причина завершения</Label>
        <Input
          id="end-reason"
          value={config.reason || ''}
          onChange={(e) => onUpdate({ reason: e.target.value })}
          placeholder="Например: Сделка закрыта"
        />
      </div>
    </div>
  );
}
