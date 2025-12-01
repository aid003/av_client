'use client';

import { useRef } from 'react';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Card } from '@/shared/ui/components/ui/card';
import type { MessageBlockConfig, ScriptSlot } from '@/entities/sales-script';
import type { ScriptNode, ScriptFlowEdge } from '../../model/types';
import { getAvailableSlotsForNode } from '../../model/graph-utils';

interface MessageBlockFormProps {
  config: MessageBlockConfig;
  onUpdate: (config: Partial<MessageBlockConfig>) => void;
  currentNodeId?: string;
  nodes?: ScriptNode[];
  edges?: ScriptFlowEdge[];
  slots?: ScriptSlot[];
}

export function MessageBlockForm({
  config,
  onUpdate,
  currentNodeId,
  nodes = [],
  edges = [],
  slots = [],
}: MessageBlockFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate available slots only when templating is enabled
  const availableSlots = currentNodeId && config.enableTemplating
    ? getAvailableSlotsForNode(currentNodeId, nodes, edges, slots)
    : [];

  const handleSlotClick = (templateSyntax: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = config.text || '';

    // Insert at cursor position (or at end if no selection)
    const newText =
      currentText.substring(0, start) +
      templateSyntax +
      currentText.substring(end);

    onUpdate({ text: newText });

    // Restore focus and set cursor after inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + templateSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message-text">Текст сообщения</Label>
        <Textarea
          ref={textareaRef}
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

      {/* Available slots section */}
      {config.enableTemplating && availableSlots.length > 0 && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Доступные переменные:</Label>
            <div className="flex flex-wrap gap-2">
              {availableSlots.map((slot) => (
                <Badge
                  key={slot.name}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                  onClick={() => handleSlotClick(slot.templateSyntax)}
                  title={`${slot.description || ''}\nИз блока: ${slot.blockTitle}`}
                >
                  {slot.templateSyntax}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({slot.type})
                  </span>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Нажмите на переменную, чтобы вставить в текст
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
