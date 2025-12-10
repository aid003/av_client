import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import type {
  ScriptDefinition,
  ScriptSlot,
  ScriptBlockType,
  EdgeConditionType,
  ConstructorSchema,
  LlmScriptSettings,
  ValidationIssue,
  ScriptValidationResult,
} from '@/entities/sales-script';
import type { ScriptNode, ScriptFlowEdge, SelectionState, PopoverState } from './types';
import {
  definitionToFlow,
  flowToDefinition,
  createEmptyBlock,
  generateEdgeId,
  generateBlockId,
  blockToNode,
} from './converters';

interface ScriptEditorState {
  // Данные скрипта
  scriptId: string | null;
  scriptName: string;
  scriptDescription: string;
  isActive: boolean;

  // React Flow данные
  nodes: ScriptNode[];
  edges: ScriptFlowEdge[];

  // Слоты
  slots: ScriptSlot[];

  // LLM настройки
  llmSettings: LlmScriptSettings | null;
  autoFillSlotsFromFirstMessage: boolean;

  // Настройки времени прочтения
  readTiming: {
    firstMessageDelaySeconds?: number;
    subsequentMessageDelaySeconds?: number;
  } | null;

  // Настройки агрегации сообщений
  messageAggregation: {
    enabled?: boolean;
    windowSeconds?: number;
  } | null;

  // Схема конструктора
  constructorSchema: ConstructorSchema | null;

  // Состояние UI
  selection: SelectionState;
  popover: PopoverState;
  isPaletteCollapsed: boolean;
  copiedNodes: ScriptNode[];
  isPanning: boolean;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Валидация
  validation: {
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    byBlockId: Record<string, ValidationIssue[]>;
    byEdgeId: Record<string, ValidationIssue[]>;
    bySlotName: Record<string, ValidationIssue[]>;
  };

  // Actions - Инициализация
  initFromDefinition: (
    scriptId: string,
    name: string,
    description: string | undefined,
    isActive: boolean,
    definition: ScriptDefinition
  ) => void;
  initFromNewScript: (
    name: string,
    description: string | undefined,
    isActive: boolean
  ) => void;
  setConstructorSchema: (schema: ConstructorSchema) => void;
  reset: () => void;

  // Actions - Nodes
  onNodesChange: (changes: NodeChange<ScriptNode>[]) => void;
  addNode: (type: ScriptBlockType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<ScriptNode['data']>) => void;
  deleteNode: (nodeId: string) => void;

  // Actions - Edges
  onEdgesChange: (changes: EdgeChange<ScriptFlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (
    edgeId: string,
    updates: { conditionType?: EdgeConditionType; label?: string }
  ) => void;
  deleteEdge: (edgeId: string) => void;

  // Actions - Slots
  setSlots: (slots: ScriptSlot[]) => void;
  addSlot: (slot: ScriptSlot) => void;
  updateSlot: (slotName: string, updates: Partial<ScriptSlot>) => void;
  removeSlot: (slotName: string) => void;

  // Actions - LLM Settings
  setLlmSettings: (settings: LlmScriptSettings | null) => void;
  setAutoFillSlotsFromFirstMessage: (value: boolean) => void;

  // Actions - Read Timing
  setReadTiming: (readTiming: {
    firstMessageDelaySeconds?: number;
    subsequentMessageDelaySeconds?: number;
  } | null) => void;

  // Actions - Message Aggregation
  setMessageAggregation: (messageAggregation: {
    enabled?: boolean;
    windowSeconds?: number;
  } | null) => void;

  // Actions - Selection
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;

  // Actions - Copy/Paste
  copySelectedNode: () => void;
  pasteNode: () => void;
  copySelectedNodes: () => void;
  pasteNodes: () => void;

  // Actions - Panning
  setPanning: (isPanning: boolean) => void;

  // Actions - Popover
  openPopover: (nodeId: string, position: { x: number; y: number }) => void;
  closePopover: () => void;

  // Actions - Palette
  togglePaletteCollapse: () => void;

  // Actions - Script metadata
  setScriptName: (name: string) => void;
  setScriptDescription: (description: string) => void;

  // Actions - Status
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  markClean: () => void;
  setValidationResult: (result: ScriptValidationResult | null) => void;
  clearValidation: () => void;

  // Getters
  getDefinition: () => ScriptDefinition;
  getSelectedNode: () => ScriptNode | null;
  getSelectedEdge: () => ScriptFlowEdge | null;
}

const initialState = {
  scriptId: null,
  scriptName: '',
  scriptDescription: '',
  isActive: true,
  nodes: [],
  edges: [],
  slots: [],
  llmSettings: null,
  autoFillSlotsFromFirstMessage: false,
  readTiming: null,
  messageAggregation: null,
  constructorSchema: null,
  selection: { type: 'none' } as SelectionState,
  popover: {
    isOpen: false,
    nodeId: null,
    anchorPosition: null,
  } as PopoverState,
  isPaletteCollapsed: false,
  copiedNodes: [],
  isPanning: false,
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,
  validation: {
    errors: [],
    warnings: [],
    byBlockId: {},
    byEdgeId: {},
    bySlotName: {},
  },
};

const buildIssueMaps = (issues: ValidationIssue[]) => {
  const byBlockId: Record<string, ValidationIssue[]> = {};
  const byEdgeId: Record<string, ValidationIssue[]> = {};
  const bySlotName: Record<string, ValidationIssue[]> = {};

  issues.forEach((issue) => {
    const normalizedSeverity =
      issue.severity === 'warning' || issue.severity === 'error' ? issue.severity : 'error';
    const normalizedIssue: ValidationIssue = { ...issue, severity: normalizedSeverity };
    const ctx = issue.context || {};

    const blockIds: string[] = [];
    if (ctx.blockId && typeof ctx.blockId === 'string') {
      blockIds.push(ctx.blockId);
    }
    if (Array.isArray((ctx as Record<string, unknown>).blockIds)) {
      const list = (ctx as Record<string, unknown>).blockIds as unknown[];
      list.forEach((id) => {
        if (typeof id === 'string') blockIds.push(id);
      });
    }
    blockIds.forEach((id) => {
      byBlockId[id] = [...(byBlockId[id] || []), normalizedIssue];
    });

    if (ctx.edgeId && typeof ctx.edgeId === 'string') {
      byEdgeId[ctx.edgeId] = [...(byEdgeId[ctx.edgeId] || []), normalizedIssue];
    }
    if (ctx.slotName && typeof ctx.slotName === 'string') {
      bySlotName[ctx.slotName] = [...(bySlotName[ctx.slotName] || []), normalizedIssue];
    }
  });

  return { byBlockId, byEdgeId, bySlotName };
};

export const useScriptEditorStore = create<ScriptEditorState>()((set, get) => ({
  ...initialState,

  // ========================================
  // Инициализация
  // ========================================

  initFromDefinition: (scriptId, name, description, isActive, definition) => {
    const { nodes, edges } = definitionToFlow(definition);
    set({
      scriptId,
      scriptName: name,
      scriptDescription: description || '',
      isActive,
      nodes,
      edges,
      slots: definition.meta.slots || [],
      llmSettings: definition.meta.llmSettings || null,
      autoFillSlotsFromFirstMessage: definition.meta.autoFillSlotsFromFirstMessage || false,
      readTiming: definition.meta.readTiming || null,
      messageAggregation: definition.meta.messageAggregation || null,
      selection: { type: 'none' },
      isDirty: false,
      error: null,
    });
  },

  initFromNewScript: (name, description, isActive) => {
    // Создаем только START блок для нового скрипта
    const startBlock = createEmptyBlock('START', { x: 100, y: 200 });
    const startNode = blockToNode(startBlock);

    set({
      scriptId: null,
      scriptName: name,
      scriptDescription: description || '',
      isActive,
      nodes: [startNode],
      edges: [],
      slots: [],
      selection: { type: 'none' },
      isDirty: false,
      error: null,
    });
  },

  setConstructorSchema: (schema) => {
    set({ constructorSchema: schema });
  },

  reset: () => {
    set(initialState);
  },

  // ========================================
  // Nodes
  // ========================================

  onNodesChange: (changes) => {
    // Проверяем есть ли значимые изменения (не selection и не dimensions)
    const hasSignificantChanges = changes.some(
      (change) => change.type !== 'select' && change.type !== 'dimensions'
    );

    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: hasSignificantChanges ? true : state.isDirty,
      validation: hasSignificantChanges
        ? {
            errors: [],
            warnings: [],
            byBlockId: {},
            byEdgeId: {},
            bySlotName: {},
          }
        : state.validation,
    }));
  },

  addNode: (type, position) => {
    const block = createEmptyBlock(type, position);
    const node = blockToNode(block);

    set((state) => ({
      nodes: [...state.nodes, node],
      isDirty: true,
      selection: { type: 'node', nodeId: node.id },
    }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
      isDirty: true,
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      isDirty: true,
      selection:
        state.selection.type === 'node' && state.selection.nodeId === nodeId
          ? { type: 'none' }
          : state.selection,
      // Закрываем popover если удаляется открытый блок
      popover:
        state.popover.nodeId === nodeId
          ? { isOpen: false, nodeId: null, anchorPosition: null }
          : state.popover,
    }));
  },

  // ========================================
  // Edges
  // ========================================

  onEdgesChange: (changes) => {
    // Проверяем есть ли значимые изменения (не select)
    const hasSignificantChanges = changes.some(
      (change) => change.type !== 'select'
    );

    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: hasSignificantChanges ? true : state.isDirty,
      validation: hasSignificantChanges
        ? {
            errors: [],
            warnings: [],
            byBlockId: {},
            byEdgeId: {},
            bySlotName: {},
          }
        : state.validation,
    }));
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;

    const edgeId = generateEdgeId(connection.source, connection.target);

    // Определяем тип условия по sourceHandle
    let conditionType: EdgeConditionType = 'ALWAYS';
    let label = 'Далее';

    if (connection.sourceHandle === 'yes') {
      conditionType = 'YES';
      label = 'Да';
    } else if (connection.sourceHandle === 'no') {
      conditionType = 'NO';
      label = 'Нет';
    } else if (connection.sourceHandle === 'other') {
      conditionType = 'OTHER';
      label = 'Другое';
    }

    const newEdge: ScriptFlowEdge = {
      id: edgeId,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
      animated: conditionType !== 'ALWAYS',
      markerEnd: { type: 'arrowclosed' },
      label,
      data: {
        edgeId,
        conditionType,
        label,
      },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
      isDirty: true,
    }));
  },

  updateEdge: (edgeId, updates) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              label: updates.label ?? edge.label,
              data: {
                ...edge.data!,
                conditionType: updates.conditionType ?? edge.data!.conditionType,
                label: updates.label ?? edge.data!.label,
              },
            }
          : edge
      ),
      isDirty: true,
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      isDirty: true,
      selection:
        state.selection.type === 'edge' && state.selection.edgeId === edgeId
          ? { type: 'none' }
          : state.selection,
    }));
  },

  // ========================================
  // Slots
  // ========================================

  setSlots: (slots) => {
    set({ slots });
  },

  addSlot: (slot) => {
    set((state) => ({
      slots: [...state.slots, slot],
      isDirty: true,
    }));
  },

  updateSlot: (slotName, updates) => {
    set((state) => ({
      slots: state.slots.map((s) =>
        s.name === slotName ? { ...s, ...updates } : s
      ),
      isDirty: true,
    }));
  },

  removeSlot: (slotName) => {
    set((state) => ({
      slots: state.slots.filter((s) => s.name !== slotName),
      isDirty: true,
    }));
  },

  // ========================================
  // LLM Settings
  // ========================================

  setLlmSettings: (settings) => {
    set({ llmSettings: settings, isDirty: true });
  },

  setAutoFillSlotsFromFirstMessage: (value) => {
    set({ autoFillSlotsFromFirstMessage: value, isDirty: true });
  },

  // ========================================
  // Read Timing
  // ========================================

  setReadTiming: (readTiming) => {
    set({ readTiming, isDirty: true });
  },

  setMessageAggregation: (messageAggregation) => {
    set({ messageAggregation, isDirty: true });
  },

  // ========================================
  // Selection
  // ========================================

  setSelection: (selection) => {
    set({ selection });
  },

  clearSelection: () => {
    set({ selection: { type: 'none' } });
  },

  // ========================================
  // Copy/Paste
  // ========================================

  copySelectedNode: () => {
    const state = get();
    const selection = state.selection;
    if (selection.type !== 'node') return;

    const nodeToCopy = state.nodes.find((n) => n.id === selection.nodeId);
    if (!nodeToCopy) return;

    set({ copiedNodes: [nodeToCopy] });
  },

  pasteNode: () => {
    const state = get();
    if (state.copiedNodes.length === 0) return;

    const copiedNode = state.copiedNodes[0];
    const newBlockId = generateBlockId(copiedNode.data.blockType);

    // Глубокое копирование config
    const newConfig = JSON.parse(JSON.stringify(copiedNode.data.config));

    // Создаем новый узел со смещением
    const newNode: ScriptNode = {
      ...copiedNode,
      id: newBlockId,
      position: {
        x: copiedNode.position.x + 50,
        y: copiedNode.position.y + 50,
      },
      data: {
        ...copiedNode.data,
        blockId: newBlockId,
        config: newConfig,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      isDirty: true,
      selection: { type: 'node', nodeId: newBlockId },
    }));
  },

  copySelectedNodes: () => {
    const state = get();

    // ReactFlow автоматически ставит selected: true при box selection
    const selectedNodes = state.nodes.filter((node) => node.selected === true);

    if (selectedNodes.length === 0) {
      // Fallback - копируем из selection
      const selection = state.selection;
      if (selection.type === 'node') {
        const nodeToCopy = state.nodes.find((n) => n.id === selection.nodeId);
        if (nodeToCopy) {
          set({ copiedNodes: [nodeToCopy] });
        }
      }
      return;
    }

    set({ copiedNodes: selectedNodes });
  },

  pasteNodes: () => {
    const state = get();
    if (state.copiedNodes.length === 0) return;

    // Находим минимальные координаты для сохранения относительных позиций
    const minX = Math.min(...state.copiedNodes.map((n) => n.position.x));
    const minY = Math.min(...state.copiedNodes.map((n) => n.position.y));

    const newNodes: ScriptNode[] = [];
    const PASTE_OFFSET = 50;

    state.copiedNodes.forEach((copiedNode) => {
      const newBlockId = generateBlockId(copiedNode.data.blockType);
      const newConfig = JSON.parse(JSON.stringify(copiedNode.data.config));

      // Сохраняем относительное положение
      const relativeX = copiedNode.position.x - minX;
      const relativeY = copiedNode.position.y - minY;

      const newNode: ScriptNode = {
        ...copiedNode,
        id: newBlockId,
        selected: false,
        position: {
          x: minX + PASTE_OFFSET + relativeX,
          y: minY + PASTE_OFFSET + relativeY,
        },
        data: {
          ...copiedNode.data,
          blockId: newBlockId,
          config: newConfig,
        },
      };

      newNodes.push(newNode);
    });

    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      isDirty: true,
      selection: { type: 'none' },
    }));
  },

  // ========================================
  // Panning
  // ========================================

  setPanning: (isPanning) => {
    set({ isPanning });
  },

  // ========================================
  // Popover
  // ========================================

  openPopover: (nodeId, position) => {
    set({
      popover: {
        isOpen: true,
        nodeId,
        anchorPosition: position,
      },
    });
  },

  closePopover: () => {
    set({
      popover: {
        isOpen: false,
        nodeId: null,
        anchorPosition: null,
      },
    });
  },

  // ========================================
  // Palette
  // ========================================

  togglePaletteCollapse: () => {
    set((state) => ({
      isPaletteCollapsed: !state.isPaletteCollapsed,
    }));
  },

  // ========================================
  // Script metadata
  // ========================================

  setScriptName: (name) => {
    set({ scriptName: name, isDirty: true });
  },

  setScriptDescription: (description) => {
    set({ scriptDescription: description, isDirty: true });
  },

  // ========================================
  // Status
  // ========================================

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setSaving: (saving) => {
    set({ isSaving: saving });
  },

  setError: (error) => {
    set({ error });
  },

  markClean: () => {
    set({ isDirty: false });
  },

  setValidationResult: (result) => {
    if (!result) {
      set({
        validation: {
          errors: [],
          warnings: [],
          byBlockId: {},
          byEdgeId: {},
          bySlotName: {},
        },
      });
      return;
    }

    const maps = buildIssueMaps([...result.errors, ...result.warnings]);

    set({
      validation: {
        errors: result.errors,
        warnings: result.warnings,
        ...maps,
      },
    });
  },

  clearValidation: () => {
    set({
      validation: {
        errors: [],
        warnings: [],
        byBlockId: {},
        byEdgeId: {},
        bySlotName: {},
      },
    });
  },

  // ========================================
  // Getters
  // ========================================

  getDefinition: () => {
    const state = get();
    return flowToDefinition(state.nodes, state.edges, {
      name: state.scriptName,
      description: state.scriptDescription || undefined,
      slots: state.slots,
      llmSettings: state.llmSettings || undefined,
      autoFillSlotsFromFirstMessage: state.autoFillSlotsFromFirstMessage || undefined,
      readTiming: state.readTiming || undefined,
      messageAggregation: state.messageAggregation || undefined,
    });
  },

  getSelectedNode: () => {
    const state = get();
    const selection = state.selection;
    if (selection.type !== 'node') return null;
    return state.nodes.find((n) => n.id === selection.nodeId) || null;
  },

  getSelectedEdge: () => {
    const state = get();
    const selection = state.selection;
    if (selection.type !== 'edge') return null;
    return state.edges.find((e) => e.id === selection.edgeId) || null;
  },
}));

// ========================================
// Селекторы
// ========================================

export const useScriptEditorNodes = () =>
  useScriptEditorStore((state) => state.nodes);

export const useScriptEditorEdges = () =>
  useScriptEditorStore((state) => state.edges);

export const useScriptEditorSlots = () =>
  useScriptEditorStore((state) => state.slots);

export const useScriptEditorLlmSettings = () =>
  useScriptEditorStore((state) => state.llmSettings);

export const useScriptEditorAutoFillSlots = () =>
  useScriptEditorStore((state) => state.autoFillSlotsFromFirstMessage);

export const useScriptEditorReadTiming = () =>
  useScriptEditorStore((state) => state.readTiming);

export const useScriptEditorMessageAggregation = () =>
  useScriptEditorStore((state) => state.messageAggregation);

export const useScriptEditorSelection = () =>
  useScriptEditorStore((state) => state.selection);

export const usePopoverState = () =>
  useScriptEditorStore((state) => state.popover);

export const useScriptEditorMeta = () =>
  useScriptEditorStore(
    useShallow((state) => ({
      scriptId: state.scriptId,
      scriptName: state.scriptName,
      scriptDescription: state.scriptDescription,
      isActive: state.isActive,
    }))
  );

export const useScriptEditorStatus = () =>
  useScriptEditorStore(
    useShallow((state) => ({
      isDirty: state.isDirty,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      error: state.error,
    }))
  );

export const useScriptEditorValidation = () =>
  useScriptEditorStore(
    useShallow((state) => ({
      errors: state.validation.errors,
      warnings: state.validation.warnings,
      byBlockId: state.validation.byBlockId,
      byEdgeId: state.validation.byEdgeId,
      bySlotName: state.validation.bySlotName,
    }))
  );

export const useScriptEditorActions = () =>
  useScriptEditorStore(
    useShallow((state) => ({
      initFromDefinition: state.initFromDefinition,
      initFromNewScript: state.initFromNewScript,
      setConstructorSchema: state.setConstructorSchema,
      reset: state.reset,
      onNodesChange: state.onNodesChange,
      addNode: state.addNode,
      updateNodeData: state.updateNodeData,
      deleteNode: state.deleteNode,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      updateEdge: state.updateEdge,
      deleteEdge: state.deleteEdge,
      setSlots: state.setSlots,
      addSlot: state.addSlot,
      updateSlot: state.updateSlot,
      removeSlot: state.removeSlot,
      setLlmSettings: state.setLlmSettings,
      setAutoFillSlotsFromFirstMessage: state.setAutoFillSlotsFromFirstMessage,
      setReadTiming: state.setReadTiming,
      setMessageAggregation: state.setMessageAggregation,
      setSelection: state.setSelection,
      clearSelection: state.clearSelection,
      copySelectedNode: state.copySelectedNode,
      pasteNode: state.pasteNode,
      copySelectedNodes: state.copySelectedNodes,
      pasteNodes: state.pasteNodes,
      setPanning: state.setPanning,
      openPopover: state.openPopover,
      closePopover: state.closePopover,
      togglePaletteCollapse: state.togglePaletteCollapse,
      setScriptName: state.setScriptName,
      setScriptDescription: state.setScriptDescription,
      setLoading: state.setLoading,
      setSaving: state.setSaving,
      setError: state.setError,
      markClean: state.markClean,
      setValidationResult: state.setValidationResult,
      clearValidation: state.clearValidation,
      getDefinition: state.getDefinition,
      getSelectedNode: state.getSelectedNode,
      getSelectedEdge: state.getSelectedEdge,
    }))
  );

export const useConstructorSchema = () =>
  useScriptEditorStore((state) => state.constructorSchema);

