'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { MessageSquare, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/components/ui/badge';
import { BaseNode } from './BaseNode';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { MessageBlockConfig } from '@/entities/sales-script';

type MessageNodeProps = NodeProps<ScriptNode>;

function formatDelay(seconds: number | undefined): string {
  if (seconds === undefined || seconds === 0) return '';
  if (seconds < 60) return `${seconds}с`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes}м`;
  return `${minutes}м ${remainingSeconds}с`;
}

export const MessageNode = memo(function MessageNode({
  data,
  selected,
}: MessageNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const validationStatus = hasError ? 'error' : hasWarning ? 'warning' : undefined;
  const config = data.config as MessageBlockConfig;

  return (
    <BaseNode
      icon={<MessageSquare className="w-4 h-4" />}
      iconBgColor="bg-blue-500"
      borderColor="border-blue-200 dark:border-blue-800"
      selected={selected}
      validationStatus={validationStatus}
      validationIssues={issues}
    >
      <div className="space-y-1">
        <div className="font-medium text-sm truncate">{data.title}</div>
        {config.text && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {config.text}
          </div>
        )}
        {config.delaySeconds !== undefined && config.delaySeconds > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            <Clock />
            {formatDelay(config.delaySeconds)}
          </Badge>
        )}
      </div>
    </BaseNode>
  );
});

