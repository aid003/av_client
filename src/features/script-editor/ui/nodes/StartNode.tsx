'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/components/ui/tooltip';

type StartNodeProps = NodeProps<ScriptNode>;

export const StartNode = memo(function StartNode({ data, selected }: StartNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const hasIssues = issues.length > 0;
  const indicatorColor = hasError
    ? 'text-destructive'
    : hasWarning
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'relative bg-green-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all',
        selected && 'ring-4 ring-green-300 ring-offset-2',
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

      <Play className="w-7 h-7 text-white fill-white" />
      
      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3! h-3! bg-white! border-2! border-green-600!"
      />
      
      {/* Label под кружком */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-muted-foreground">
        {data.title}
      </div>
    </div>
  );
});

