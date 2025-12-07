'use client';

import { memo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/components/ui/tooltip';
import type { ValidationIssue } from '@/entities/sales-script';

interface BaseNodeProps {
  children: ReactNode;
  icon: ReactNode;
  iconBgColor: string;
  borderColor: string;
  selected?: boolean;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  sourceHandles?: Array<{
    id: string;
    position: Position;
    label?: string;
    style?: React.CSSProperties;
  }>;
  validationStatus?: 'error' | 'warning';
  validationIssues?: ValidationIssue[];
}

export const BaseNode = memo(function BaseNode({
  children,
  icon,
  iconBgColor,
  borderColor,
  selected,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandles,
  validationStatus,
  validationIssues,
}: BaseNodeProps) {
  const hasIssues = (validationIssues?.length ?? 0) > 0;
  const hasError = validationIssues?.some((issue) => issue.severity === 'error');
  const hasWarning = validationIssues?.some((issue) => issue.severity === 'warning');
  const indicatorColor = hasError
    ? 'text-destructive'
    : hasWarning
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg shadow-md border-2 min-w-[180px] max-w-[240px] transition-all',
        selected && 'ring-2 ring-primary ring-offset-2',
        validationStatus === 'error'
          ? 'border-destructive shadow-[0_0_0_2px_rgba(239,68,68,0.12)]'
          : validationStatus === 'warning'
            ? 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.16)]'
            : borderColor
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
            {validationIssues?.map((issue, index) => (
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
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
        />
      )}

      {/* Content */}
      <div className="flex items-start gap-3 p-3">
        <div
          className={cn(
            'shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white',
            iconBgColor
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Source Handles */}
      {showSourceHandle && !sourceHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
        />
      )}

      {/* Custom source handles for router */}
      {sourceHandles?.map((handle) => (
        <Handle
          key={handle.id}
          type="source"
          position={handle.position}
          id={handle.id}
          className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
          style={handle.style}
        />
      ))}
    </div>
  );
});

