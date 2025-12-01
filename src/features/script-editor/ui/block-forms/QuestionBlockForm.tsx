'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Slider } from '@/shared/ui/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { SlotsManagementDialog } from '../dialogs/SlotsManagementDialog';
import type { QuestionBlockConfig, ScriptSlot } from '@/entities/sales-script';
import { DelaySecondsInput } from './DelaySecondsInput';

interface QuestionBlockFormProps {
  config: QuestionBlockConfig;
  slots: ScriptSlot[];
  onUpdate: (config: Partial<QuestionBlockConfig>) => void;
}

export function QuestionBlockForm({
  config,
  slots,
  onUpdate,
}: QuestionBlockFormProps) {
  const [showSlotsDialog, setShowSlotsDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-slot">Слот для записи</Label>

        <div className="flex gap-2">
          <Select
            value={config.slot || ''}
            onValueChange={(value) => onUpdate({ slot: value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Выберите слот" />
            </SelectTrigger>
            <SelectContent>
              {slots.length === 0 && (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  Нет слотов.<br />Создайте слот через кнопку &quot;Управление&quot;
                </div>
              )}
              {slots.map((slot) => (
                <SelectItem key={slot.name} value={slot.name}>
                  {slot.name} ({slot.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowSlotsDialog(true)}
            title="Управление слотами"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-text">Текст вопроса</Label>
        <Textarea
          id="question-text"
          value={config.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Вопрос, который зададим клиенту..."
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="question-required">Обязательный</Label>
        <Switch
          id="question-required"
          checked={config.required || false}
          onCheckedChange={(checked) => {
            if (!checked) {
              // Clear maxRetries when required becomes false
              onUpdate({ required: checked, maxRetries: undefined });
            } else {
              onUpdate({ required: checked });
            }
          }}
        />
      </div>

      {config.required && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Макс. попыток переспроса: {config.maxRetries || '—'}</Label>
          </div>
          <Slider
            value={[config.maxRetries || 3]}
            onValueChange={(values: number[]) => onUpdate({ maxRetries: values[0] })}
            min={1}
            max={10}
            step={1}
          />
          <div className="text-xs text-muted-foreground">
            От 1 до 10 попыток
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="question-hint">Подсказка для ИИ</Label>
        <Textarea
          id="question-hint"
          value={config.hintForLLM || ''}
          onChange={(e) => onUpdate({ hintForLLM: e.target.value })}
          placeholder="Как извлечь значение из ответа..."
          rows={2}
        />
      </div>

      {/* Delay configuration */}
      <DelaySecondsInput
        value={config.delaySeconds}
        onChange={(value) => onUpdate({ delaySeconds: value })}
      />

      <SlotsManagementDialog
        open={showSlotsDialog}
        onOpenChange={setShowSlotsDialog}
      />
    </div>
  );
}
