'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import type { RouterBlockConfig } from '@/entities/sales-script';

interface RouterBlockFormProps {
  config: RouterBlockConfig;
  onUpdate: (config: Partial<RouterBlockConfig>) => void;
}

export function RouterBlockForm({ config, onUpdate }: RouterBlockFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="router-instruction">Инструкция для ИИ</Label>
        <Textarea
          id="router-instruction"
          value={config.instruction || ''}
          onChange={(e) => onUpdate({ instruction: e.target.value })}
          placeholder="По какому критерию определять ветку..."
          rows={4}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Режим: {config.mode || 'YES_NO_OTHER'}
      </div>
    </div>
  );
}
