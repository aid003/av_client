'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { AlertCircle, GitBranch } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { MultiRouterBlockConfig } from '@/entities/sales-script';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/components/ui/tooltip';

type MultiRouterNodeProps = NodeProps<ScriptNode>;

export const MultiRouterNode = memo(function MultiRouterNode({
  data,
  selected,
}: MultiRouterNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const validationStatus = hasError ? 'error' : hasWarning ? 'warning' : undefined;
  const config = data.config as MultiRouterBlockConfig;
  const questions = config.questions || [];
  const hasIssues = issues.length > 0;
  const indicatorColor = hasError
    ? 'text-destructive'
    : hasWarning
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg shadow-md border-2 min-w-[220px] transition-all',
        validationStatus === 'error'
          ? 'border-destructive shadow-[0_0_0_2px_rgba(239,68,68,0.12)]'
          : validationStatus === 'warning'
            ? 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.16)]'
            : 'border-indigo-300 dark:border-indigo-700',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {hasIssues && (
        <Tooltip>
          <TooltipTrigger
            className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 shadow-sm"
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
        className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
      />

      {/* Header */}
      <div className="flex items-start gap-3 p-3 border-b border-indigo-200 dark:border-indigo-800">
        <div className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white bg-indigo-500">
          <GitBranch className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.title}</div>
          {config.instruction && (
            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {config.instruction}
            </div>
          )}
        </div>
      </div>

      {/* Choices */}
      <div className="py-2">
        {questions.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Нет вариантов
          </div>
        )}
        {questions.map((question, index) => {
          const title = question.text || question.id || `Вариант ${index + 1}`;
          const handleId = question.id ? `choice-${question.id}` : `choice-${index + 1}`;

          return (
            <div
              key={`${question.id}-${index}`}
              className="flex items-center justify-between px-3 py-1.5 relative"
              title={title}
            >
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">
                {title}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                className="w-3! h-3! bg-indigo-500! border-2! border-background!"
                style={{ top: 'auto', right: -6 }}
              />
            </div>
          );
        })}

        {/* Fallback */}
        <div className="flex items-center justify-between px-3 py-1.5 relative">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
            Другое
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id="other"
            className="w-3! h-3! bg-slate-400! border-2! border-background!"
            style={{ top: 'auto', right: -6 }}
          />
        </div>
      </div>
    </div>
  );
});
