'use client';

import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import {
  useScriptEditorNodes,
  useScriptEditorEdges,
  useScriptEditorActions,
} from '../model/store';
import type { ScriptBlockType } from '@/entities/sales-script';
import type { ScriptNode, ScriptFlowEdge } from '../model/types';

export function EditorCanvas() {
  const nodes = useScriptEditorNodes();
  const edges = useScriptEditorEdges();
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelection,
    addNode,
  } = useScriptEditorActions();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<ScriptNode, ScriptFlowEdge> | null>(null);

  // Обработчик инициализации React Flow
  const onInit = useCallback((instance: ReactFlowInstance<ScriptNode, ScriptFlowEdge>) => {
    reactFlowInstance.current = instance;
  }, []);

  // Обработчик клика по ноде
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelection({ type: 'node', nodeId: node.id });
    },
    [setSelection]
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
  }, [setSelection]);

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

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
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
          className="bg-background border rounded-lg shadow-md"
        />
      </ReactFlow>
    </div>
  );
}

