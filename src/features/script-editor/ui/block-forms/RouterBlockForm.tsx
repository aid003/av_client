'use client';

import { HelpCircle } from 'lucide-react';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip';
import type { RouterBlockConfig } from '@/entities/sales-script';
import { LLMSettingsSection } from '../llm-settings';

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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="router-defer-until-next-user">Отложить ветвление</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Если перед роутером был ответ бота, дождется следующего сообщения пользователя
                и только потом выберет ветку. Если роутер идет сразу после START, ветвление
                произойдет сразу.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="router-defer-until-next-user"
          checked={config.deferUntilNextUser ?? false}
          onCheckedChange={(checked) => onUpdate({ deferUntilNextUser: checked })}
        />
      </div>

      {/* LLM Settings */}
      <LLMSettingsSection
        blockType="ROUTER"
        config={config}
        onUpdate={onUpdate}
      />
    </div>
  );
}
