'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  EditorCanvas,
  EditorHeader,
  BlocksPalette,
  PropertiesPanel,
  useScriptEditorActions,
  useScriptEditorNodes,
} from '@/features/script-editor';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/shared/ui/components/ui/resizable';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { SalesScript } from '@/entities/sales-script';

interface ScriptEditorProps {
  script: SalesScript;
  tenantId: string;
  isLoading?: boolean;
  error?: string | null;
}

export function ScriptEditor({
  script,
  tenantId,
  isLoading,
  error,
}: ScriptEditorProps) {
  const { initFromDefinition, reset } = useScriptEditorActions();
  const nodes = useScriptEditorNodes();

  // Инициализация store при монтировании
  useEffect(() => {
    if (script && script.definition) {
      initFromDefinition(
        script.id,
        script.name,
        script.description,
        script.isActive,
        script.definition
      );
    }

    // Очистка при размонтировании
    return () => {
      reset();
    };
  }, [script, initFromDefinition, reset]);

  // Проверяем есть ли блок START
  const hasStartBlock = nodes.some((n) => n.data.blockType === 'START');

  if (isLoading) {
    return <ScriptEditorSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen bg-background">
        <EditorHeader tenantId={tenantId} />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Blocks Palette */}
          <ResizablePanel
            defaultSize={15}
            minSize={12}
            maxSize={25}
            className="border-r"
          >
            <BlocksPalette hasStartBlock={hasStartBlock} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Canvas */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <EditorCanvas />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Properties */}
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={35}
            className="border-l"
          >
            <PropertiesPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ReactFlowProvider>
  );
}

function ScriptEditorSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1">
        <div className="w-[15%] border-r p-4 space-y-3">
          <Skeleton className="h-4 w-16" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
        <div className="flex-1 bg-muted/30" />
        <div className="w-[25%] border-l p-4 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

