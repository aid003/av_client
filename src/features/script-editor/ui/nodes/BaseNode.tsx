'use client';

import { memo, type ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/shared/lib/utils';

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
}: BaseNodeProps) {
  return (
    <div
      className={cn(
        'relative bg-background rounded-lg shadow-md border-2 min-w-[180px] max-w-[240px] transition-all',
        selected && 'ring-2 ring-primary ring-offset-2',
        borderColor
      )}
    >
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

