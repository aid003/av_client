'use client';

import { useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Button } from '@/shared/ui/components/ui/button';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Slider } from '@/shared/ui/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Separator } from '@/shared/ui/components/ui/separator';
import {
  useScriptEditorSelection,
  useScriptEditorMeta,
  useScriptEditorSlots,
  useScriptEditorActions,
} from '../model/store';
import type {
  MessageBlockConfig,
  QuestionBlockConfig,
  RouterBlockConfig,
  LLMReplyBlockConfig,
  EndBlockConfig,
  ScriptBlockType,
} from '@/entities/sales-script';
import type { ScriptNode } from '../model/types';

export function PropertiesPanel() {
  const selection = useScriptEditorSelection();
  const meta = useScriptEditorMeta();
  const slots = useScriptEditorSlots();
  const {
    setScriptName,
    setScriptDescription,
    updateNodeData,
    deleteNode,
    getSelectedNode,
    getSelectedEdge,
    deleteEdge,
  } = useScriptEditorActions();

  const selectedNode = getSelectedNode();
  const selectedEdge = getSelectedEdge();

  // Если ничего не выбрано — показываем настройки скрипта
  if (selection.type === 'none') {
    return (
      <ScriptPropertiesForm
        name={meta.scriptName}
        description={meta.scriptDescription}
        onNameChange={setScriptName}
        onDescriptionChange={setScriptDescription}
      />
    );
  }

  // Если выбрано ребро
  if (selection.type === 'edge' && selectedEdge) {
    return (
      <EdgePropertiesForm
        edge={selectedEdge}
        onDelete={() => deleteEdge(selectedEdge.id)}
      />
    );
  }

  // Если выбрана нода
  if (selection.type === 'node' && selectedNode) {
    return (
      <NodePropertiesForm
        node={selectedNode}
        slots={slots}
        onUpdate={(data) => updateNodeData(selectedNode.id, data)}
        onDelete={() => deleteNode(selectedNode.id)}
      />
    );
  }

  return null;
}

// ============================================
// Script Properties Form
// ============================================

interface ScriptPropertiesFormProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
}

function ScriptPropertiesForm({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: ScriptPropertiesFormProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Настройки скрипта
        </h3>

        <div className="space-y-2">
          <Label htmlFor="script-name">Название</Label>
          <Input
            id="script-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Название скрипта"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="script-description">Описание</Label>
          <Textarea
            id="script-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Описание скрипта"
            rows={3}
          />
        </div>
      </div>
    </ScrollArea>
  );
}

// ============================================
// Edge Properties Form
// ============================================

interface EdgePropertiesFormProps {
  edge: ReturnType<ReturnType<typeof useScriptEditorActions>['getSelectedEdge']>;
  onDelete: () => void;
}

function EdgePropertiesForm({ edge, onDelete }: EdgePropertiesFormProps) {
  if (!edge) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Связь
          </h3>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Тип условия</Label>
          <div className="text-sm text-muted-foreground">
            {edge.data?.conditionType || 'ALWAYS'}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Метка</Label>
          <div className="text-sm">{edge.label || '—'}</div>
        </div>
      </div>
    </ScrollArea>
  );
}

// ============================================
// Node Properties Form
// ============================================

interface NodePropertiesFormProps {
  node: ScriptNode;
  slots: Array<{ name: string; type: string }>;
  onUpdate: (data: Partial<ScriptNode['data']>) => void;
  onDelete: () => void;
}

function NodePropertiesForm({
  node,
  slots,
  onUpdate,
  onDelete,
}: NodePropertiesFormProps) {
  const blockType = node.data.blockType;
  const isStartNode = blockType === 'START';

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {getBlockTypeLabel(blockType)}
          </h3>
          {!isStartNode && (
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>

        {/* Название блока */}
        <div className="space-y-2">
          <Label htmlFor="block-title">Название</Label>
          <Input
            id="block-title"
            value={node.data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Название блока"
          />
        </div>

        <Separator />

        {/* Специфичные настройки по типу блока */}
        {blockType === 'MESSAGE' && (
          <MessageBlockForm
            config={node.data.config as MessageBlockConfig}
            onUpdate={(config) =>
              onUpdate({ config: { ...node.data.config, ...config } })
            }
          />
        )}

        {blockType === 'QUESTION' && (
          <QuestionBlockForm
            config={node.data.config as QuestionBlockConfig}
            slots={slots}
            onUpdate={(config) =>
              onUpdate({ config: { ...node.data.config, ...config } })
            }
          />
        )}

        {blockType === 'ROUTER' && (
          <RouterBlockForm
            config={node.data.config as RouterBlockConfig}
            onUpdate={(config) =>
              onUpdate({ config: { ...node.data.config, ...config } })
            }
          />
        )}

        {blockType === 'LLM_REPLY' && (
          <LLMReplyBlockForm
            config={node.data.config as LLMReplyBlockConfig}
            onUpdate={(config) =>
              onUpdate({ config: { ...node.data.config, ...config } })
            }
          />
        )}

        {blockType === 'END' && (
          <EndBlockForm
            config={node.data.config as EndBlockConfig}
            onUpdate={(config) =>
              onUpdate({ config: { ...node.data.config, ...config } })
            }
          />
        )}
      </div>
    </ScrollArea>
  );
}

// ============================================
// Block-Specific Forms
// ============================================

function MessageBlockForm({
  config,
  onUpdate,
}: {
  config: MessageBlockConfig;
  onUpdate: (config: Partial<MessageBlockConfig>) => void;
}) {
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

function QuestionBlockForm({
  config,
  slots,
  onUpdate,
}: {
  config: QuestionBlockConfig;
  slots: Array<{ name: string; type: string }>;
  onUpdate: (config: Partial<QuestionBlockConfig>) => void;
}) {
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

function RouterBlockForm({
  config,
  onUpdate,
}: {
  config: RouterBlockConfig;
  onUpdate: (config: Partial<RouterBlockConfig>) => void;
}) {
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

function LLMReplyBlockForm({
  config,
  onUpdate,
}: {
  config: LLMReplyBlockConfig;
  onUpdate: (config: Partial<LLMReplyBlockConfig>) => void;
}) {
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
    </div>
  );
}

function EndBlockForm({
  config,
  onUpdate,
}: {
  config: EndBlockConfig;
  onUpdate: (config: Partial<EndBlockConfig>) => void;
}) {
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

// ============================================
// Utils
// ============================================

function getBlockTypeLabel(type: ScriptBlockType): string {
  switch (type) {
    case 'START':
      return 'Старт';
    case 'MESSAGE':
      return 'Сообщение';
    case 'QUESTION':
      return 'Вопрос';
    case 'ROUTER':
      return 'Разветвление';
    case 'LLM_REPLY':
      return 'Ответ ИИ';
    case 'END':
      return 'Конец';
    default:
      return 'Блок';
  }
}

