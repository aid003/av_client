'use client';

import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  EditorCanvas,
  EditorHeader,
  BlocksPalette,
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

interface NewScriptData {
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
}

interface ScriptEditorProps {
  script: SalesScript | null;
  tenantId: string;
  newScriptData?: NewScriptData;
  isLoading?: boolean;
  error?: string | null;
}

export function ScriptEditor({
  script,
  tenantId,
  newScriptData,
  isLoading,
  error,
}: ScriptEditorProps) {
  const { initFromDefinition, initFromNewScript, reset } = useScriptEditorActions();
  const nodes = useScriptEditorNodes();

  // Инициализация store при монтировании
  useEffect(() => {
    if (script && script.definition) {
      // Инициализация существующего скрипта
      initFromDefinition(
        script.id,
        script.name,
        script.description,
        script.isActive,
        script.definition
      );
    } else if (newScriptData) {
      // Инициализация нового скрипта
      initFromNewScript(
        newScriptData.name,
        newScriptData.description,
        newScriptData.isActive
      );
    }

    // Очистка при размонтировании
    return () => {
      reset();
    };
  }, [script, newScriptData, initFromDefinition, initFromNewScript, reset]);

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
      <div className="flex flex-col h-[calc(100vh-3rem)] bg-background">
        <EditorHeader tenantId={tenantId} />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Blocks Palette */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="border-r"
          >
            <BlocksPalette hasStartBlock={hasStartBlock} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center - Canvas (теперь занимает всю оставшуюся ширину) */}
          <ResizablePanel defaultSize={80} minSize={70}>
            <EditorCanvas />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ReactFlowProvider>
  );
}

function ScriptEditorSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-background">
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

