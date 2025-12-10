'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Sparkles, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/components/ui/badge';
import { BaseNode } from './BaseNode';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { LLMReplyBlockConfig } from '@/entities/sales-script';

type LLMReplyNodeProps = NodeProps<ScriptNode>;

function formatDelay(seconds: number | undefined): string {
  if (seconds === undefined || seconds === 0) return '';
  if (seconds < 60) return `${seconds}с`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes}м`;
  return `${minutes}м ${remainingSeconds}с`;
}

export const LLMReplyNode = memo(function LLMReplyNode({
  data,
  selected,
}: LLMReplyNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const validationStatus = hasError ? 'error' : hasWarning ? 'warning' : undefined;
  const config = data.config as LLMReplyBlockConfig;

  return (
    <BaseNode
      icon={<Sparkles className="w-4 h-4" />}
      iconBgColor="bg-gradient-to-br from-violet-500 to-purple-600"
      borderColor="border-violet-200 dark:border-violet-800"
      selected={selected}
      validationStatus={validationStatus}
      validationIssues={issues}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="font-medium text-sm truncate flex-1">{data.title}</div>
          {config.useKnowledgeBase && (
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
        </div>
        {config.instruction && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {config.instruction}
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

