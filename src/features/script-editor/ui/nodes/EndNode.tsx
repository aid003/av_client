'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';
import type { EndBlockConfig } from '@/entities/sales-script';

type EndNodeProps = NodeProps<ScriptNode>;

export const EndNode = memo(function EndNode({ data, selected }: EndNodeProps) {
  const config = data.config as EndBlockConfig;
  
  return (
    <div
      className={cn(
        'relative bg-red-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all',
        selected && 'ring-4 ring-red-300 ring-offset-2'
      )}
    >
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

