'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
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
import type { LLMReplyBlockConfig } from '@/entities/sales-script';
import { DelaySettingsSection } from './DelaySettingsSection';
import { LLMSettingsSection } from '../llm-settings';

interface LLMReplyBlockFormProps {
  config: LLMReplyBlockConfig;
  onUpdate: (config: Partial<LLMReplyBlockConfig>) => void;
}

export function LLMReplyBlockForm({ config, onUpdate }: LLMReplyBlockFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="llm-instruction">Инструкция</Label>
        <Textarea
          id="llm-instruction"
          value={config.instruction || ''}
          onChange={(e) => onUpdate({ instruction: e.target.value })}
          placeholder="Что нейросеть должна сделать..."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="use-kb">Использовать базу знаний</Label>
        <Switch
          id="use-kb"
          checked={config.useKnowledgeBase || false}
          onCheckedChange={(checked) => onUpdate({ useKnowledgeBase: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="llm-style">Стиль ответа</Label>
        <Select
          value={config.style || 'NORMAL'}
          onValueChange={(value) =>
            onUpdate({ style: value as LLMReplyBlockConfig['style'] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SHORT">Краткий</SelectItem>
            <SelectItem value="NORMAL">Обычный</SelectItem>
            <SelectItem value="DETAILED">Подробный</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Температура: {config.temperature?.toFixed(1) || '0.7'}</Label>
        </div>
        <Slider
          value={[config.temperature || 0.7]}
          onValueChange={(values: number[]) => onUpdate({ temperature: values[0] })}
          min={0}
          max={1}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-tokens">Макс. токенов</Label>
        <Input
          id="max-tokens"
          type="number"
          value={config.maxTokens || 500}
          onChange={(e) => onUpdate({ maxTokens: parseInt(e.target.value) || 500 })}
          min={100}
          max={2000}
        />
      </div>

      {/* Delay configuration */}
      <DelaySettingsSection
        value={config.delaySeconds}
        onChange={(value) => onUpdate({ delaySeconds: value })}
      />

      {/* LLM Settings */}
      <LLMSettingsSection
        blockType="LLM_REPLY"
        config={config}
        onUpdate={onUpdate}
      />
    </div>
  );
}
