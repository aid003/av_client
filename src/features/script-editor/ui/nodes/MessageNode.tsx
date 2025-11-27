'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { BaseNode } from './BaseNode';
import type { ScriptNode } from '../../model/types';
import type { MessageBlockConfig } from '@/entities/sales-script';

type MessageNodeProps = NodeProps<ScriptNode>;

export const MessageNode = memo(function MessageNode({
  data,
  selected,
}: MessageNodeProps) {
  const config = data.config as MessageBlockConfig;

  return (
    <BaseNode
      icon={<MessageSquare className="w-4 h-4" />}
      iconBgColor="bg-blue-500"
      borderColor="border-blue-200 dark:border-blue-800"
      selected={selected}
    >
      <div className="space-y-1">
        <div className="font-medium text-sm truncate">{data.title}</div>
        {config.text && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {config.text}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

