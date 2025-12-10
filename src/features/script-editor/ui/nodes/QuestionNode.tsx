'use client';

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
import { HelpCircle, RotateCcw, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/components/ui/badge';
import { BaseNode } from './BaseNode';
import type { ScriptNode } from '../../model/types';
import { useScriptEditorValidation } from '../../model/store';
import type { QuestionBlockConfig } from '@/entities/sales-script';

type QuestionNodeProps = NodeProps<ScriptNode>;

function formatDelay(seconds: number | undefined): string {
  if (seconds === undefined || seconds === 0) return '';
  if (seconds < 60) return `${seconds}с`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes}м`;
  return `${minutes}м ${remainingSeconds}с`;
}

export const QuestionNode = memo(function QuestionNode({
  data,
  selected,
}: QuestionNodeProps) {
  const { byBlockId } = useScriptEditorValidation();
  const issues = byBlockId[data.blockId] || [];
  const hasError = issues.some((issue) => issue.severity === 'error');
  const hasWarning = issues.some((issue) => issue.severity === 'warning');
  const validationStatus = hasError ? 'error' : hasWarning ? 'warning' : undefined;
  const config = data.config as QuestionBlockConfig;

  return (
    <BaseNode
      icon={<HelpCircle className="w-4 h-4" />}
      iconBgColor="bg-amber-500"
      borderColor="border-amber-200 dark:border-amber-800"
      selected={selected}
      validationStatus={validationStatus}
      validationIssues={issues}
    >
      <div className="space-y-1.5">
        <div className="font-medium text-sm truncate">{data.title}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {config.slot && (
            <Badge variant="secondary" className="text-xs">
              {config.slot}
            </Badge>
          )}
          {config.maxRetries !== undefined && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <RotateCcw />
              {config.maxRetries}
            </Badge>
          )}
          {config.delaySeconds !== undefined && config.delaySeconds > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <Clock />
              {formatDelay(config.delaySeconds)}
            </Badge>
          )}
        </div>
        {config.text && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {config.text}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

