'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/components/ui/card';
import { Progress } from '@/shared/ui/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Button } from '@/shared/ui/components/ui/button';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { BroadcastProgress as ProgressType } from '../lib/use-broadcast';

interface BroadcastProgressProps {
  progress: ProgressType;
  errors: Array<{ tenantId: string; error: string }>;
  isComplete: boolean;
}

export function BroadcastProgress({ progress, errors, isComplete }: BroadcastProgressProps) {
  const [showErrors, setShowErrors] = useState(false);

  const percentage = progress.total > 0 ? (progress.sent / progress.total) * 100 : 0;
  const successCount = progress.sent - progress.failed;

  if (!isComplete && progress.total === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {isComplete ? 'Рассылка завершена' : 'Отправка...'}
          </span>
          <span className="text-muted-foreground">
            {progress.sent} / {progress.total}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>
            Успешно: <strong>{successCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="h-4 w-4 text-destructive" />
          <span>
            Ошибок: <strong>{progress.failed}</strong>
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowErrors(!showErrors)}
            className="w-full justify-between"
          >
            <span>Показать ошибки ({errors.length})</span>
            {showErrors ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showErrors && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {errors.map((err, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription className="text-xs">
                    <div className="font-mono text-xs mb-1">ID: {err.tenantId}</div>
                    <div>{err.error}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
