'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { EndBlockConfig } from '@/entities/sales-script';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/components/ui/tooltip';

type EndNodeProps = NodeProps<ScriptNode>;

export const EndNode = memo(function EndNode({ data, selected }: EndNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const config = data.config as EndBlockConfig;
  const hasIssues = issues.length > 0;
  const indicatorColor = hasError
    ? 'text-destructive'
    : hasWarning
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-muted-foreground';
  
  return (
    <div
      className={cn(
        'relative bg-red-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all',
        selected && 'ring-4 ring-red-300 ring-offset-2',
        hasError
          ? 'ring-4 ring-destructive/70 ring-offset-2'
          : !hasError && hasWarning
            ? 'ring-4 ring-amber-300 ring-offset-2'
            : null
      )}
    >
      {hasIssues && (
        <Tooltip>
          <TooltipTrigger
            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/80 shadow"
            aria-label="Показать ошибки блока"
          >
            <AlertCircle className={cn('w-4 h-4', indicatorColor)} />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-1">
            {issues.map((issue, index) => (
              <div
                key={`${issue.code}-${index}`}
                className={cn(
                  'text-xs leading-snug',
                  issue.severity === 'error'
                    ? 'text-destructive'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {issue.message}
              </div>
            ))}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-white! border-2! border-red-600!"
      />
      
      <Square className="w-6 h-6 text-white fill-white" />
      
      {/* Label под кружком */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground max-w-[100px] truncate">
        {data.title}
      </div>
      
      {/* Reason tooltip */}
      {config.reason && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground/70 max-w-[150px] truncate">
          {config.reason}
        </div>
      )}
    </div>
  );
});

