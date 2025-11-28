'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import type { QuestionBlockConfig, ScriptSlot } from '@/entities/sales-script';

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
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-slot">Слот для записи</Label>
        <Select
          value={config.slot || ''}
          onValueChange={(value) => onUpdate({ slot: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите слот" />
          </SelectTrigger>
          <SelectContent>
            {slots.map((slot) => (
              <SelectItem key={slot.name} value={slot.name}>
                {slot.name} ({slot.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>

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
    </div>
  );
}
