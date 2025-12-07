'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Slider } from '@/shared/ui/components/ui/slider';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip';
import { ModelSelect } from '../llm-settings/ModelSelect';
import { getLlmMetadata, deleteScriptState } from '@/entities/sales-script/api';
import {
  useScriptEditorLlmSettings,
  useScriptEditorAutoFillSlots,
  useScriptEditorReadTiming,
  useScriptEditorActions,
  useScriptEditorMeta,
} from '../../model/store';
import { ReadTimingSettings } from '../read-timing/ReadTimingSettings';
import { ClearStateDialog } from './ClearStateDialog';
import type { LlmScriptSettings, LlmMetadataResponse, LlmOperationInfo } from '@/entities/sales-script';

interface LLMSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

// Дефолтные значения моделей по умолчанию
const DEFAULT_MODELS: NonNullable<LlmScriptSettings['defaultModels']> = {
  generateReply: 'gpt-4.1-mini',
  classifyYesNoOther: 'gpt-4o-mini',
  extractSlots: 'gpt-4o-mini',
  isAnswerRelevant: 'gpt-4o-mini',
  rephraseQuestion: 'gpt-4.1-mini',
  normalizeSlotValue: 'gpt-4o-mini',
};

export function LLMSettingsDialog({ open, onOpenChange, tenantId }: LLMSettingsDialogProps) {
  const llmSettings = useScriptEditorLlmSettings();
  const autoFillSlots = useScriptEditorAutoFillSlots();
  const readTiming = useScriptEditorReadTiming();
  const meta = useScriptEditorMeta();
  const { setLlmSettings, setAutoFillSlotsFromFirstMessage, setReadTiming } = useScriptEditorActions();

  // Локальное состояние для редактирования
  const [localSettings, setLocalSettings] = useState<LlmScriptSettings>({
    defaultModels: {},
    defaultPrompts: {},
    defaultTemperature: 0.7,
    defaultMaxTokens: 512,
  });
  const [localAutoFill, setLocalAutoFill] = useState(false);
  const [localReadTiming, setLocalReadTiming] = useState<{
    firstMessageDelaySeconds?: number;
    subsequentMessageDelaySeconds?: number;
  } | null>(null);
  const [metadata, setMetadata] = useState<LlmMetadataResponse | null>(null);
  const [showAdvancedModels, setShowAdvancedModels] = useState(false);
  const [showAdvancedPrompts, setShowAdvancedPrompts] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Refs for auto-scroll
  const advancedModelsRef = useRef<HTMLDivElement>(null);
  const advancedPromptsRef = useRef<HTMLDivElement>(null);

  // Загрузка метаданных при открытии диалога
  useEffect(() => {
    if (open) {
      getLlmMetadata().then(setMetadata);
      
      // Используем существующие настройки или дефолтные значения
      const existingModels = llmSettings?.defaultModels || {};
      
      // Всегда показываем все модели с дефолтными значениями
      // Если пользователь уже выбрал свои значения - используем их, иначе дефолты
      const defaultModels = {
        ...DEFAULT_MODELS,
        ...existingModels,
      };
      
      setLocalSettings({
        defaultModels,
        defaultPrompts: llmSettings?.defaultPrompts || {},
        defaultTemperature: llmSettings?.defaultTemperature ?? 0.7,
        defaultMaxTokens: llmSettings?.defaultMaxTokens ?? 512,
      });
      setLocalAutoFill(autoFillSlots);
      // Если readTiming null, устанавливаем дефолтные значения 3 секунды
      setLocalReadTiming(
        readTiming || {
          firstMessageDelaySeconds: 3,
          subsequentMessageDelaySeconds: 3,
        }
      );
    }
  }, [open, llmSettings, autoFillSlots, readTiming]);

  // Auto-scroll to advanced models when expanded
  useEffect(() => {
    if (showAdvancedModels && advancedModelsRef.current) {
      setTimeout(() => {
        advancedModelsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  }, [showAdvancedModels]);

  // Auto-scroll to advanced prompts when expanded
  useEffect(() => {
    if (showAdvancedPrompts && advancedPromptsRef.current) {
      setTimeout(() => {
        advancedPromptsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  }, [showAdvancedPrompts]);

  // Получить информацию об операции
  const getOperationInfo = (operationId: string): LlmOperationInfo | undefined => {
    return metadata?.availableOperations.find((op) => op.id === operationId);
  };

  // Получить дефолтный промпт для операции
  const getDefaultPrompt = (operationId: string): string => {
    return metadata?.promptTemplates[operationId]?.default || '';
  };

  // Получить описание промпта
  const getPromptDescription = (operationId: string): string => {
    return metadata?.promptTemplates[operationId]?.description || '';
  };

  const handleSave = () => {
    // Сохраняем настройки - теперь дефолтные модели всегда присутствуют
    // Проверяем есть ли кастомные промпты, температура, токены или автофилл
    const hasPrompts = Object.keys(localSettings.defaultPrompts || {}).some(
      (key) => localSettings.defaultPrompts?.[key as keyof typeof localSettings.defaultPrompts]
    );
    const hasCustomTemperature = localSettings.defaultTemperature !== 0.7;
    const hasCustomMaxTokens = localSettings.defaultMaxTokens !== 512;

    // Всегда сохраняем настройки (включая дефолтные модели), если есть хоть что-то измененное
    // или если это первый раз сохранения (чтобы установить дефолты)
    const hasSettings = 
      Object.keys(localSettings.defaultModels || {}).length > 0 || 
      hasPrompts || 
      hasCustomTemperature || 
      hasCustomMaxTokens || 
      localAutoFill;

    setLlmSettings(hasSettings ? localSettings : null);
    setAutoFillSlotsFromFirstMessage(localAutoFill);
    setReadTiming(localReadTiming);
    onOpenChange(false);
  };

  const handleResetAll = () => {
    setLocalSettings({
      defaultModels: {},
      defaultPrompts: {},
      defaultTemperature: 0.7,
      defaultMaxTokens: 512,
    });
    setLocalAutoFill(false);
    setLocalReadTiming(null);
  };

  const handleClearState = async () => {
    if (!meta.scriptId) return;

    setIsClearing(true);
    try {
      await deleteScriptState(meta.scriptId, tenantId);
      setShowClearConfirm(false);
      setClearSuccess(true);

      // Auto-close dialog after showing success message
      setTimeout(() => {
        setClearSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      // Handle error - could show alert
      console.error('Failed to clear script state:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // Обновить модель для операции
  const updateModel = (operationId: string, modelId: string | undefined) => {
    setLocalSettings({
      ...localSettings,
      defaultModels: {
        ...localSettings.defaultModels,
        [operationId]: modelId,
      },
    });
  };

  // Обновить промпт для операции
  const updatePrompt = (operationId: string, prompt: string | undefined) => {
    setLocalSettings({
      ...localSettings,
      defaultPrompts: {
        ...localSettings.defaultPrompts,
        [operationId]: prompt,
      },
    });
  };

  // Сбросить промпт к шаблону
  const resetPromptToTemplate = (operationId: string) => {
    const template = getDefaultPrompt(operationId);
    updatePrompt(operationId, template);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Настройки LLM</DialogTitle>
          <DialogDescription className="text-xs">
            Настройте модели и параметры LLM для всего скрипта. Эти настройки будут использоваться
            по умолчанию, если не переопределены в отдельных блоках.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="models" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            <TabsTrigger value="models" className="text-xs px-1.5">Модели</TabsTrigger>
            <TabsTrigger value="prompts" className="text-xs px-1.5">Промпты</TabsTrigger>
            <TabsTrigger value="parameters" className="text-xs px-1.5">Параметры</TabsTrigger>
            <TabsTrigger value="readTiming" className="text-xs px-1.5">Прочтение</TabsTrigger>
            <TabsTrigger value="clear" className="text-xs px-1.5">Очистка</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            {/* Таб: Модели */}
            <TabsContent value="models" className="space-y-6 mt-0">
              <div className="space-y-4">
                <h3 className="font-medium text-xs">Основные модели</h3>

                {/* generateReply */}
                <ModelSelect
                  label={
                    <div className="flex items-center gap-2">
                      <span>Модель для генерации ответов</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getOperationInfo('generateReply')?.description || 
                              'Используется в блоках LLM_REPLY для формирования текста ответа клиенту'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  }
                  value={localSettings.defaultModels?.generateReply}
                  onChange={(value) => updateModel('generateReply', value)}
                  showBadge={false}
                  showReset={false}
                />

                {/* classifyYesNoOther */}
                <ModelSelect
                  label={
                    <div className="flex items-center gap-2">
                      <span>Модель для классификации YES/NO/OTHER</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getOperationInfo('classifyYesNoOther')?.description || 
                              'Используется в блоках ROUTER для определения ветвления диалога'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  }
                  value={localSettings.defaultModels?.classifyYesNoOther}
                  onChange={(value) => updateModel('classifyYesNoOther', value)}
                  showBadge={false}
                  showReset={false}
                />

                {/* extractSlots */}
                <ModelSelect
                  label={
                    <div className="flex items-center gap-2">
                      <span>Модель для извлечения слотов</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getOperationInfo('extractSlots')?.description || 
                              'Используется в блоках QUESTION для извлечения значений слотов из ответа клиента'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  }
                  value={localSettings.defaultModels?.extractSlots}
                  onChange={(value) => updateModel('extractSlots', value)}
                  showBadge={false}
                  showReset={false}
                />

                {/* rephraseQuestion */}
                <ModelSelect
                  label={
                    <div className="flex items-center gap-2">
                      <span>Модель для переформулировки вопроса</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getOperationInfo('rephraseQuestion')?.description || 
                              'Используется в блоках QUESTION при переспросе с мини-отработкой возражения'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  }
                  value={localSettings.defaultModels?.rephraseQuestion}
                  onChange={(value) => updateModel('rephraseQuestion', value)}
                  showBadge={false}
                  showReset={false}
                />
              </div>

              {/* Расширенные модели */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedModels(!showAdvancedModels)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                >
                  {showAdvancedModels ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Дополнительные модели</span>
                </button>

                {showAdvancedModels && (
                  <div ref={advancedModelsRef} className="space-y-4 pl-6 border-l-2">
                    {/* isAnswerRelevant */}
                    <ModelSelect
                      label={
                        <div className="flex items-center gap-2">
                          <span>Модель для проверки релевантности</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {getOperationInfo('isAnswerRelevant')?.description || 
                                  'Определяет, отвечает ли клиент на заданный вопрос'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      }
                      value={localSettings.defaultModels?.isAnswerRelevant}
                      onChange={(value) => updateModel('isAnswerRelevant', value)}
                      showBadge={false}
                      showReset={false}
                    />

                    {/* normalizeSlotValue */}
                    <ModelSelect
                      label={
                        <div className="flex items-center gap-2">
                          <span>Модель для нормализации значения слота</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {getOperationInfo('normalizeSlotValue')?.description || 
                                  'Приводит извлеченное значение слота к нужному типу'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      }
                      value={localSettings.defaultModels?.normalizeSlotValue}
                      onChange={(value) => updateModel('normalizeSlotValue', value)}
                      showBadge={false}
                      showReset={false}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Таб: Промпты */}
            <TabsContent value="prompts" className="space-y-6 mt-0">
              <div className="space-y-4">
                <h3 className="font-medium text-xs">Основные промпты</h3>

                {/* generateReply prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Промпт для генерации ответов</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getPromptDescription('generateReply') || 
                              'Системный промпт для блоков LLM_REPLY'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetPromptToTemplate('generateReply')}
                      >
                        Шаблон
                      </Button>
                      {localSettings.defaultPrompts?.generateReply && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updatePrompt('generateReply', undefined)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={localSettings.defaultPrompts?.generateReply || getDefaultPrompt('generateReply')}
                    onChange={(e) => updatePrompt('generateReply', e.target.value || undefined)}
                    placeholder="Системный промпт для генерации ответов"
                    rows={3}
                  />
                </div>

                {/* classifyYesNoOther prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Промпт для классификации</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getPromptDescription('classifyYesNoOther') || 
                              'Системный промпт для блоков ROUTER'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetPromptToTemplate('classifyYesNoOther')}
                      >
                        Шаблон
                      </Button>
                      {localSettings.defaultPrompts?.classifyYesNoOther && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updatePrompt('classifyYesNoOther', undefined)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={localSettings.defaultPrompts?.classifyYesNoOther || getDefaultPrompt('classifyYesNoOther')}
                    onChange={(e) => updatePrompt('classifyYesNoOther', e.target.value || undefined)}
                    placeholder="Системный промпт для классификации"
                    rows={3}
                  />
                </div>

                {/* extractSlots prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Промпт для извлечения слотов</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getPromptDescription('extractSlots') || 
                              'Промпт для извлечения значений слотов в блоках QUESTION'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetPromptToTemplate('extractSlots')}
                      >
                        Шаблон
                      </Button>
                      {localSettings.defaultPrompts?.extractSlots && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updatePrompt('extractSlots', undefined)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={localSettings.defaultPrompts?.extractSlots || getDefaultPrompt('extractSlots')}
                    onChange={(e) => updatePrompt('extractSlots', e.target.value || undefined)}
                    placeholder="Промпт для извлечения слотов"
                    rows={2}
                  />
                </div>

                {/* rephraseQuestion prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Промпт для переформулировки вопроса</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {getPromptDescription('rephraseQuestion') || 
                              'Промпт для переспроса в блоках QUESTION'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetPromptToTemplate('rephraseQuestion')}
                      >
                        Шаблон
                      </Button>
                      {localSettings.defaultPrompts?.rephraseQuestion && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updatePrompt('rephraseQuestion', undefined)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={localSettings.defaultPrompts?.rephraseQuestion || getDefaultPrompt('rephraseQuestion')}
                    onChange={(e) => updatePrompt('rephraseQuestion', e.target.value || undefined)}
                    placeholder="Промпт для переформулировки вопроса"
                    rows={2}
                  />
                </div>
              </div>

              {/* Расширенные промпты */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedPrompts(!showAdvancedPrompts)}
                  className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
                >
                  {showAdvancedPrompts ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>Дополнительные промпты</span>
                </button>

                {showAdvancedPrompts && (
                  <div ref={advancedPromptsRef} className="space-y-4 pl-6 border-l-2">
                    {/* isAnswerRelevant prompt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>Промпт для проверки релевантности</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {getPromptDescription('isAnswerRelevant') || 
                                  'Промпт для проверки релевантности ответа'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resetPromptToTemplate('isAnswerRelevant')}
                          >
                            Шаблон
                          </Button>
                          {localSettings.defaultPrompts?.isAnswerRelevant && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updatePrompt('isAnswerRelevant', undefined)}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={localSettings.defaultPrompts?.isAnswerRelevant || getDefaultPrompt('isAnswerRelevant')}
                        onChange={(e) => updatePrompt('isAnswerRelevant', e.target.value || undefined)}
                        placeholder="Промпт для проверки релевантности"
                        rows={2}
                      />
                    </div>

                    {/* normalizeSlotValue prompt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label>Промпт для нормализации значения слота</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {getPromptDescription('normalizeSlotValue') || 
                                  'Промпт для нормализации значений слотов'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resetPromptToTemplate('normalizeSlotValue')}
                          >
                            Шаблон
                          </Button>
                          {localSettings.defaultPrompts?.normalizeSlotValue && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updatePrompt('normalizeSlotValue', undefined)}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={localSettings.defaultPrompts?.normalizeSlotValue || getDefaultPrompt('normalizeSlotValue')}
                        onChange={(e) => updatePrompt('normalizeSlotValue', e.target.value || undefined)}
                        placeholder="Промпт для нормализации значений слотов"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Таб: Параметры */}
            <TabsContent value="parameters" className="space-y-6 mt-0">
              <div className="space-y-4">
                <h3 className="font-medium text-xs">Параметры по умолчанию</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Температура: {localSettings.defaultTemperature?.toFixed(1) || '0.7'}</Label>
                  </div>
                  <Slider
                    value={[localSettings.defaultTemperature || 0.7]}
                    onValueChange={(values: number[]) =>
                      setLocalSettings({
                        ...localSettings,
                        defaultTemperature: values[0],
                      })
                    }
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Контролирует случайность ответов. Низкие значения — более предсказуемые ответы,
                    высокие — более креативные.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Макс. токенов</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    value={localSettings.defaultMaxTokens || 512}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        defaultMaxTokens: parseInt(e.target.value) || 512,
                      })
                    }
                    min={100}
                    max={4000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Максимальная длина генерируемого ответа в токенах.
                  </p>
                </div>
              </div>

              {/* Дополнительные настройки */}
              <div className="space-y-4">
                <h3 className="font-medium text-xs">Дополнительно</h3>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-fill">Автозаполнение слотов из первого сообщения</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Если включено, система попытается извлечь значения всех слотов из первого
                            сообщения пользователя при запуске скрипта, используя LLM.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматически заполняет слоты, если информация указана в первом сообщении
                    </p>
                  </div>
                  <Switch
                    id="auto-fill"
                    checked={localAutoFill}
                    onCheckedChange={setLocalAutoFill}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Таб: Время прочтения */}
            <TabsContent value="readTiming" className="mt-0">
              <ReadTimingSettings
                firstMessageDelaySeconds={localReadTiming?.firstMessageDelaySeconds}
                subsequentMessageDelaySeconds={localReadTiming?.subsequentMessageDelaySeconds}
                onFirstMessageChange={(value) =>
                  setLocalReadTiming({
                    ...localReadTiming,
                    firstMessageDelaySeconds: value,
                  })
                }
                onSubsequentMessageChange={(value) =>
                  setLocalReadTiming({
                    ...localReadTiming,
                    subsequentMessageDelaySeconds: value,
                  })
                }
              />
            </TabsContent>

            {/* Таб: Очистка */}
            <TabsContent value="clear" className="space-y-6 mt-0">
              <div className="space-y-4">
                {clearSuccess ? (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Состояние скрипта успешно очищено!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Внимание! Эта операция необратима и предназначена для тестирования изменений в скрипте.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h3 className="font-medium text-xs">Сброс для тестирования</h3>
                      <p className="text-sm text-muted-foreground">
                        Этот функционал позволяет заново протестировать изменения в скрипте на аккаунтах, которые уже общались с ботом. При очистке:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                        <li>Сбрасывается вся история диалогов со скриптом</li>
                        <li>Аккаунты смогут начать диалог заново, как в первый раз</li>
                        <li>Привязки скрипта к чатам сохранятся, автозапуск продолжит работать</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        Используйте эту функцию когда нужно проверить новую версию скрипта на реальных аккаунтах.
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        onClick={() => setShowClearConfirm(true)}
                        disabled={!meta.scriptId || isClearing}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isClearing ? 'Очистка...' : 'Очистить состояние скрипта'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-row justify-between">
          <Button type="button" variant="outline" onClick={handleResetAll}>
            Сбросить все
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Clear state confirmation dialog */}
      <ClearStateDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearState}
        isClearing={isClearing}
      />
    </Dialog>
  );
}