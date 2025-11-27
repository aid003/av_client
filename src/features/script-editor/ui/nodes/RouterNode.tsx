'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';
import type { RouterBlockConfig } from '@/entities/sales-script';

type RouterNodeProps = NodeProps<ScriptNode>;

export const RouterNode = memo(function RouterNode({
  data,
  selected,
}: RouterNodeProps) {
  const config = data.config as RouterBlockConfig;

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg shadow-md border-2 min-w-[200px] transition-all',
        'border-purple-300 dark:border-purple-700',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3! h-3! bg-muted-foreground! border-2! border-background!"
      />

      {/* Header */}
      <div className="flex items-start gap-3 p-3 border-b border-purple-200 dark:border-purple-800">
        <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white bg-purple-500">
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

      {/* Branches */}
      <div className="py-2">
        {/* YES */}
        <div className="flex items-center justify-between px-3 py-1.5 relative">
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Да
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id="yes"
            className="w-3! h-3! bg-green-500! border-2! border-background!"
            style={{ top: 'auto', right: -6 }}
          />
        </div>

        {/* NO */}
        <div className="flex items-center justify-between px-3 py-1.5 relative">
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Нет
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id="no"
            className="w-3! h-3! bg-red-500! border-2! border-background!"
            style={{ top: 'auto', right: -6 }}
          />
        </div>

        {/* OTHER */}
        <div className="flex items-center justify-between px-3 py-1.5 relative">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Другое
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id="other"
            className="w-3! h-3! bg-gray-500! border-2! border-background!"
            style={{ top: 'auto', right: -6 }}
          />
        </div>
      </div>
    </div>
  );
});

