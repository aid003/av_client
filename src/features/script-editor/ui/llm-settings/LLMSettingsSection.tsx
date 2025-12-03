'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip';
import { ModelSelect } from './ModelSelect';
import { useScriptEditorLlmSettings } from '../../model/store';
import type { ScriptBlockType } from '@/entities/sales-script';

interface LLMSettingsSectionProps {
  /**
   * Тип блока для определения какие поля показывать
   */
  blockType: 'LLM_REPLY' | 'ROUTER' | 'QUESTION';

  /**
   * Текущая конфигурация блока
   */
  config: {
    model?: string;
    systemPrompt?: string;
    extractModel?: string;
    extractSystemPrompt?: string;
    rephraseModel?: string;
    rephraseSystemPrompt?: string;
  };

  /**
   * Callback при изменении конфигурации
   */
  onUpdate: (updates: Partial<LLMSettingsSectionProps['config']>) => void;
}

export function LLMSettingsSection({
  blockType,
  config,
  onUpdate,
}: LLMSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const llmSettings = useScriptEditorLlmSettings();

  // Определяем дефолтные модели из глобальных настроек
  const getDefaultModel = (operation: string): string | undefined => {
    if (!llmSettings?.defaultModels) return undefined;

    switch (operation) {
      case 'generateReply':
        return llmSettings.defaultModels.generateReply;
      case 'classifyYesNoOther':
        return llmSettings.defaultModels.classifyYesNoOther;
      case 'extractSlots':
        return llmSettings.defaultModels.extractSlots;
      case 'rephraseQuestion':
        return llmSettings.defaultModels.rephraseQuestion;
      default:
        return undefined;
    }
  };

  // Проверяем есть ли кастомные настройки
  const hasCustomSettings = () => {
    if (blockType === 'QUESTION') {
      return (
        config.extractModel ||
        config.extractSystemPrompt ||
        config.rephraseModel ||
        config.rephraseSystemPrompt
      );
    }
    return config.model || config.systemPrompt;
  };

  return (
    <div className="space-y-2 border-t pt-4 mt-4">
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm font-medium hover:opacity-70 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>Настройки LLM</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Эти настройки переопределяют глобальные настройки LLM для этого конкретного блока.
                Если поле не заполнено, используется значение из глобальных настроек скрипта.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Badge variant={hasCustomSettings() ? 'default' : 'secondary'} className="text-xs">
          {hasCustomSettings() ? 'Custom settings' : 'Using defaults'}
        </Badge>
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {blockType === 'LLM_REPLY' && (
            <>
              <ModelSelect
                label="Модель для генерации"
                value={config.model}
                defaultModel={getDefaultModel('generateReply')}
                onChange={(value) => onUpdate({ model: value })}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Системный промпт</Label>
                  {config.systemPrompt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdate({ systemPrompt: undefined })}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <Textarea
                  value={config.systemPrompt || ''}
                  onChange={(e) => onUpdate({ systemPrompt: e.target.value || undefined })}
                  placeholder="Оставьте пустым для использования стандартного промпта"
                  rows={3}
                />
              </div>
            </>
          )}

          {blockType === 'ROUTER' && (
            <>
              <ModelSelect
                label="Модель для классификации"
                value={config.model}
                defaultModel={getDefaultModel('classifyYesNoOther')}
                onChange={(value) => onUpdate({ model: value })}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Системный промпт</Label>
                  {config.systemPrompt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdate({ systemPrompt: undefined })}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <Textarea
                  value={config.systemPrompt || ''}
                  onChange={(e) => onUpdate({ systemPrompt: e.target.value || undefined })}
                  placeholder="Оставьте пустым для использования стандартного промпта"
                  rows={3}
                />
              </div>
            </>
          )}

          {blockType === 'QUESTION' && (
            <>
              <h4 className="text-sm font-medium">Настройки извлечения слота</h4>

              <ModelSelect
                label="Модель для извлечения"
                value={config.extractModel}
                defaultModel={getDefaultModel('extractSlots')}
                onChange={(value) => onUpdate({ extractModel: value })}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Промпт для извлечения</Label>
                  {config.extractSystemPrompt && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdate({ extractSystemPrompt: undefined })}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <Textarea
                  value={config.extractSystemPrompt || ''}
                  onChange={(e) =>
                    onUpdate({ extractSystemPrompt: e.target.value || undefined })
                  }
                  placeholder="Оставьте пустым для использования стандартного промпта"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-4">Настройки переспроса</h4>

                <ModelSelect
                  label="Модель для переспроса"
                  value={config.rephraseModel}
                  defaultModel={getDefaultModel('rephraseQuestion')}
                  onChange={(value) => onUpdate({ rephraseModel: value })}
                />

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Промпт для переспроса</Label>
                    {config.rephraseSystemPrompt && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdate({ rephraseSystemPrompt: undefined })}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={config.rephraseSystemPrompt || ''}
                    onChange={(e) =>
                      onUpdate({ rephraseSystemPrompt: e.target.value || undefined })
                    }
                    placeholder="Оставьте пустым для использования стандартного промпта"
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Эти настройки переопределяют глобальные настройки LLM для этого блока.
          </p>
        </div>
      )}
    </div>
  );
}
