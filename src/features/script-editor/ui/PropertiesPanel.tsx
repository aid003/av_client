'use client';

import { Trash2 } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Button } from '@/shared/ui/components/ui/button';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Separator } from '@/shared/ui/components/ui/separator';
import {
  useScriptEditorSelection,
  useScriptEditorMeta,
  useScriptEditorSlots,
  useScriptEditorNodes,
  useScriptEditorEdges,
  useScriptEditorActions,
} from '../model/store';
import type {
  MessageBlockConfig,
  QuestionBlockConfig,
  RouterBlockConfig,
  MultiRouterBlockConfig,
  LLMReplyBlockConfig,
  EndBlockConfig,
} from '@/entities/sales-script';
import type { ScriptNode } from '../model/types';
import {
  MessageBlockForm,
  QuestionBlockForm,
  RouterBlockForm,
  MultiRouterBlockForm,
  LLMReplyBlockForm,
  EndBlockForm,
  getBlockTypeLabel,
} from './block-forms';

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
  slots: import('@/entities/sales-script').ScriptSlot[];
  onUpdate: (data: Partial<ScriptNode['data']>) => void;
  onDelete: () => void;
}

function NodePropertiesForm({
  node,
  slots,
  onUpdate,
  onDelete,
}: NodePropertiesFormProps) {
  const nodes = useScriptEditorNodes();
  const edges = useScriptEditorEdges();
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
            currentNodeId={node.id}
            nodes={nodes}
            edges={edges}
            slots={slots}
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

        {blockType === 'MULTI_ROUTER' && (
          <MultiRouterBlockForm
            config={node.data.config as MultiRouterBlockConfig}
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

