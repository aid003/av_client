'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { Sparkles, BookOpen } from 'lucide-react';
import { Badge } from '@/shared/ui/components/ui/badge';
import { BaseNode } from './BaseNode';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { LLMReplyBlockConfig } from '@/entities/sales-script';

type LLMReplyNodeProps = NodeProps<ScriptNode>;

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
        <div className="flex items-center gap-1.5 flex-wrap">
          {config.style && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {config.style === 'SHORT' ? 'Кратко' : config.style === 'DETAILED' ? 'Подробно' : 'Обычно'}
            </Badge>
          )}
          {config.temperature !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              t={config.temperature}
            </Badge>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

