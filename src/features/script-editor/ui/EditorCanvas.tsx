'use client';

import { useCallback, useEffect, useMemo, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useOnViewportChange,
  SelectionMode,
  type ReactFlowInstance,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { BlockEditPopover } from './BlockEditPopover';
import {
  useScriptEditorNodes,
  useScriptEditorEdges,
  useScriptEditorActions,
  useScriptEditorStore,
  useScriptEditorValidation,
} from '../model/store';
import type { ScriptBlockType } from '@/entities/sales-script';
import type { ScriptNode, ScriptFlowEdge } from '../model/types';
import { cn } from '@/shared/lib/utils';

export function EditorCanvas() {
  const nodes = useScriptEditorNodes();
  const edges = useScriptEditorEdges();
  const validation = useScriptEditorValidation();
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelection,
    addNode,
    openPopover,
    closePopover,
    copySelectedNodes,
    pasteNodes,
    setPanning,
  } = useScriptEditorActions();

  const isPanning = useScriptEditorStore((state) => state.isPanning);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<ScriptNode, ScriptFlowEdge> | null>(null);

  // Закрываем попап при движении/зуме канваса
  useOnViewportChange({
    onStart: () => {
      closePopover();
    },
  });

  // Обработчик инициализации React Flow
  const onInit = useCallback((instance: ReactFlowInstance<ScriptNode, ScriptFlowEdge>) => {
    reactFlowInstance.current = instance;
  }, []);

  // Обработчик клика по ноде
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      // Находим DOM элемент блока
      const nodeElement = (event.target as HTMLElement).closest('.react-flow__node');

      if (nodeElement) {
        const rect = nodeElement.getBoundingClientRect();

        // Вычисляем позицию с учетом viewport
        const popoverWidth = 380; // Ширина попапа из BlockEditPopover
        const popoverHeight = 400; // Примерная высота (или можем использовать max-h-[60vh])
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        let x = rect.right + 10; // Справа от блока
        let y = rect.top; // Сверху

        // Проверяем горизонтальное переполнение
        if (x + popoverWidth > viewportWidth) {
          x = rect.left - popoverWidth - 10; // Слева от блока
        }

        // Проверяем вертикальное переполнение
        const estimatedHeight = Math.min(popoverHeight, viewportHeight * 0.6); // 60vh
        if (y + estimatedHeight > viewportHeight) {
          y = Math.max(20, viewportHeight - estimatedHeight - 20);
        }

        openPopover(node.id, { x, y });
      }

      setSelection({ type: 'node', nodeId: node.id });
    },
    [openPopover, setSelection]
  );

  // Обработчик клика по ребру
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setSelection({ type: 'edge', edgeId: edge.id });
    },
    [setSelection]
  );

  // Обработчик клика по пустому пространству
  const onPaneClick = useCallback(() => {
    setSelection({ type: 'none' });
    closePopover();
  }, [setSelection, closePopover]);

  // Обработчик начала перетаскивания ноды
  const onNodeDragStart = useCallback(() => {
    closePopover();
  }, [closePopover]);

  // Обработчики panning
  const onMoveStart = useCallback(() => {
    setPanning(true);
    closePopover();
  }, [setPanning, closePopover]);

  const onMoveEnd = useCallback(() => {
    setTimeout(() => {
      setPanning(false);
    }, 300); // Соответствует transition в CSS
  }, [setPanning]);

  // Drag & Drop обработчики
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type') as ScriptBlockType;
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) {
        return;
      }

      // FIX: Принудительный reflow для актуальных размеров
      void reactFlowWrapper.current.offsetHeight;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [addNode]
  );

  // Обработчик клавиатуры для копирования/вставки
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверяем Ctrl/Cmd модификатор
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      if (!isModifier) return;

      // Игнорируем если фокус в input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        copySelectedNodes();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        pasteNodes();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        copySelectedNodes();
        pasteNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedNodes, pasteNodes]);

  const edgesWithValidation: ScriptFlowEdge[] = useMemo(() => {
    return edges.map((edge) => {
      const edgeId = edge.data?.edgeId ?? edge.id;
      const issues = validation.byEdgeId[edgeId] || [];
      const hasError = issues.some((issue) => issue.severity === 'error');
      const hasWarning = issues.some((issue) => issue.severity === 'warning');

      const stroke = hasError ? '#ef4444' : hasWarning ? '#f59e0b' : edge.style?.stroke;
      const strokeWidth = hasError || hasWarning ? 2.5 : edge.style?.strokeWidth;

      return {
        ...edge,
        style: {
          ...edge.style,
          stroke,
          strokeWidth,
        },
        animated: hasError ? true : edge.animated,
      } as ScriptFlowEdge;
    });
  }, [edges, validation.byEdgeId]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edgesWithValidation}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        panOnDrag={[2]}
        panOnScroll={true}
        panActivationKeyCode="Space"
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Meta"
        deleteKeyCode={['Delete', 'Backspace']}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-muted/30"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="opacity-50"
        />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          className="bg-background border rounded-lg shadow-md"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className={cn(
            "bg-background border rounded-lg shadow-md transition-opacity duration-300 ease-in-out",
            isPanning ? "opacity-100" : "opacity-0"
          )}
          style={{
            pointerEvents: isPanning ? 'auto' : 'none',
          }}
        />
      </ReactFlow>

      {/* Popover для редактирования блоков */}
      <BlockEditPopover />
    </div>
  );
}

