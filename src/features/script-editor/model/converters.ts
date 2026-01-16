import type { MarkerType } from '@xyflow/react';
import type {
  ScriptDefinition,
  ScriptBlock,
  ScriptEdge,
  ScriptBlockType,
  EdgeCondition,
} from '@/entities/sales-script';
import type { ScriptNode, ScriptFlowEdge, ScriptNodeData } from './types';

/**
 * Конвертирует definition в формат React Flow
 */
export function definitionToFlow(definition: ScriptDefinition): {
  nodes: ScriptNode[];
  edges: ScriptFlowEdge[];
} {
  const nodes: ScriptNode[] = definition.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    position: { x: block.x, y: block.y },
    data: {
      blockId: block.id,
      blockType: block.type,
      title: block.title,
      config: block.config,
    },
  }));

  const edges: ScriptFlowEdge[] = definition.edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    sourceHandle: getSourceHandle(edge.condition),
    label: edge.label,
    type: 'smoothstep',
    animated: edge.condition.type !== 'ALWAYS',
    markerEnd: { type: 'arrowclosed' as MarkerType },
    data: {
      edgeId: edge.id,
      conditionType: edge.condition.type,
      conditionValue: edge.condition.value,
      label: edge.label,
    },
  }));

  return { nodes, edges };
}

/**
 * Конвертирует React Flow обратно в definition
 */
export function flowToDefinition(
  nodes: ScriptNode[],
  edges: ScriptFlowEdge[],
  meta: ScriptDefinition['meta']
): ScriptDefinition {
  const blocks: ScriptBlock[] = nodes.map((node) => ({
    id: node.id,
    type: node.data.blockType,
    title: node.data.title,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    config: node.data.config,
  }));

  const scriptEdges: ScriptEdge[] = edges.map((edge) => {
    const conditionType = edge.data?.conditionType || 'ALWAYS';
    const conditionValue =
      edge.data?.conditionValue || getChoiceValueFromHandle(edge.sourceHandle);

    const condition: EdgeCondition = { type: conditionType };
    if (conditionType === 'CHOICE' && conditionValue) {
      condition.value = conditionValue;
    }

    return {
      id: edge.id,
      from: edge.source,
      to: edge.target,
      condition,
      label: edge.data?.label || edge.label?.toString(),
    };
  });

  return {
    version: 1,
    meta,
    blocks,
    edges: scriptEdges,
  };
}

/**
 * Определяет source handle для ребра по типу условия
 */
function getSourceHandle(condition: EdgeCondition): string | undefined {
  switch (condition.type) {
    case 'YES':
      return 'yes';
    case 'NO':
      return 'no';
    case 'OTHER':
      return 'other';
    case 'CHOICE':
      return condition.value ? `choice-${condition.value}` : undefined;
    default:
      return undefined;
  }
}

function getChoiceValueFromHandle(sourceHandle?: string | null): string | undefined {
  if (!sourceHandle) return undefined;
  if (!sourceHandle.startsWith('choice-')) return undefined;
  return sourceHandle.slice('choice-'.length) || undefined;
}

/**
 * Генерирует уникальный ID для нового блока
 */
export function generateBlockId(type: ScriptBlockType): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${type.toLowerCase()}_${timestamp}_${random}`;
}

/**
 * Генерирует уникальный ID для нового ребра
 */
export function generateEdgeId(sourceId: string, targetId: string): string {
  const timestamp = Date.now().toString(36);
  return `edge_${sourceId}_${targetId}_${timestamp}`;
}

/**
 * Создаёт пустой блок по типу
 */
export function createEmptyBlock(
  type: ScriptBlockType,
  position: { x: number; y: number }
): ScriptBlock {
  const id = generateBlockId(type);
  const title = getDefaultBlockTitle(type);
  const config = getDefaultBlockConfig(type);

  return {
    id,
    type,
    title,
    x: position.x,
    y: position.y,
    config,
  };
}

/**
 * Возвращает заголовок блока по умолчанию
 */
function getDefaultBlockTitle(type: ScriptBlockType): string {
  switch (type) {
    case 'START':
      return 'Начало';
    case 'MESSAGE':
      return 'Сообщение';
    case 'QUESTION':
      return 'Вопрос';
    case 'ROUTER':
      return 'Разветвление';
    case 'MULTI_ROUTER':
      return 'Множественное ветвление';
    case 'LLM_REPLY':
      return 'Ответ ИИ';
    case 'END':
      return 'Конец';
    default:
      return 'Блок';
  }
}

/**
 * Возвращает конфигурацию блока по умолчанию
 */
function getDefaultBlockConfig(type: ScriptBlockType): ScriptBlock['config'] {
  switch (type) {
    case 'START':
      return {};
    case 'MESSAGE':
      return {
        text: '',
        enableTemplating: false,
      };
    case 'QUESTION':
      return {
        slot: '',
        text: '',
        required: false,
        hintForLLM: '',
      };
    case 'ROUTER':
      return {
        mode: 'YES_NO_OTHER',
        instruction: '',
        deferUntilNextUser: false,
      };
    case 'MULTI_ROUTER':
      return {
        questions: [],
        instruction: '',
        minConfidence: 0.6,
        deferUntilNextUser: false,
      };
    case 'LLM_REPLY':
      return {
        instruction: '',
        useKnowledgeBase: true,
        maxTokens: 500,
        temperature: 0.7,
        style: 'NORMAL',
      };
    case 'END':
      return {
        reason: '',
      };
    default:
      return {};
  }
}

/**
 * Создаёт пустой definition
 */
export function createEmptyDefinition(name: string, description?: string): ScriptDefinition {
  const startBlock = createEmptyBlock('START', { x: 100, y: 200 });

  return {
    version: 1,
    meta: {
      name,
      description,
      slots: [],
    },
    blocks: [startBlock],
    edges: [],
  };
}

/**
 * Конвертирует ScriptBlock в ScriptNode
 */
export function blockToNode(block: ScriptBlock): ScriptNode {
  return {
    id: block.id,
    type: block.type,
    position: { x: block.x, y: block.y },
    data: {
      blockId: block.id,
      blockType: block.type,
      title: block.title,
      config: block.config,
    },
  };
}

/**
 * Конвертирует ScriptNode в ScriptBlock
 */
export function nodeToBlock(node: ScriptNode): ScriptBlock {
  return {
    id: node.id,
    type: node.data.blockType,
    title: node.data.title,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    config: node.data.config,
  };
}
