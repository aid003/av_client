'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import type { MessageBlockConfig } from '@/entities/sales-script';

interface MessageBlockFormProps {
  config: MessageBlockConfig;
  onUpdate: (config: Partial<MessageBlockConfig>) => void;
}

export function MessageBlockForm({ config, onUpdate }: MessageBlockFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message-text">Текст сообщения</Label>
        <Textarea
          id="message-text"
          value={config.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Текст, который увидит клиент..."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="enable-templating">Использовать переменные</Label>
        <Switch
          id="enable-templating"
          checked={config.enableTemplating || false}
          onCheckedChange={(checked) => onUpdate({ enableTemplating: checked })}
        />
      </div>
    </div>
  );
}
