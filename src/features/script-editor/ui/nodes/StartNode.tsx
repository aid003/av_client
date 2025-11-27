'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ScriptNode } from '../../model/types';

type StartNodeProps = NodeProps<ScriptNode>;

export const StartNode = memo(function StartNode({ data, selected }: StartNodeProps) {
  return (
    <div
      className={cn(
        'relative bg-green-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all',
        selected && 'ring-4 ring-green-300 ring-offset-2'
      )}
    >
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

