import type { Node, Edge } from '@xyflow/react';
import type {
  ScriptBlock,
  ScriptBlockType,
  ScriptBlockConfig,
  EdgeConditionType,
} from '@/entities/sales-script';

/**
 * Данные узла React Flow для блока скрипта
 */
export interface ScriptNodeData extends Record<string, unknown> {
  blockId: string;
  blockType: ScriptBlockType;
  title: string;
  config: ScriptBlockConfig;
  isSelected?: boolean;
}

/**
 * Узел React Flow для блока скрипта
 */
export type ScriptNode = Node<ScriptNodeData, ScriptBlockType>;

/**
 * Данные ребра React Flow
 */
export interface ScriptEdgeData extends Record<string, unknown> {
  edgeId: string;
  conditionType: EdgeConditionType;
  label?: string;
}

/**
 * Ребро React Flow для связи
 */
export type ScriptFlowEdge = Edge<ScriptEdgeData>;

/**
 * Тип перетаскиваемого блока
 */
export interface DraggedBlockType {
  type: ScriptBlockType;
  label: string;
}

/**
 * Позиция на канвасе
 */
export interface CanvasPosition {
  x: number;
  y: number;
}

/**
 * Состояние выбора
 */
export type SelectionState =
  | { type: 'none' }
  | { type: 'node'; nodeId: string }
  | { type: 'edge'; edgeId: string };

/**
 * Состояние Popover редактирования блока
 */
export interface PopoverState {
  isOpen: boolean;
  nodeId: string | null;
  anchorPosition: { x: number; y: number } | null;
}

