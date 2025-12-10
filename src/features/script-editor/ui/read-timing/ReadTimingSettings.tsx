'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Slider } from '@/shared/ui/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ReadTimingSettingsProps {
  firstMessageDelaySeconds?: number;
  subsequentMessageDelaySeconds?: number;
  onFirstMessageChange: (value: number | undefined) => void;
  onSubsequentMessageChange: (value: number | undefined) => void;
}

function formatDelay(seconds: number | undefined): string {
  if (seconds === undefined || seconds === 0) return 'сразу';
  if (seconds < 60) return `${seconds} сек`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes} мин`;
  return `${minutes} мин ${remainingSeconds} сек`;
}

export function ReadTimingSettings({
  firstMessageDelaySeconds,
  subsequentMessageDelaySeconds,
  onFirstMessageChange,
  onSubsequentMessageChange,
}: ReadTimingSettingsProps) {
  const firstValue = firstMessageDelaySeconds ?? 3;
  const subsequentValue = subsequentMessageDelaySeconds ?? 3;
  const firstSliderValue = Math.min(firstValue, 260);
  const subsequentSliderValue = Math.min(subsequentValue, 260);

  const handleFirstSliderChange = (values: number[]) => {
    const newValue = values[0] || 0;
    onFirstMessageChange(newValue === 0 ? undefined : newValue);
  };

  const handleSubsequentSliderChange = (values: number[]) => {
    const newValue = values[0] || 0;
    onSubsequentMessageChange(newValue === 0 ? undefined : newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium text-xs">Задержки прочтения</h3>
        <p className="text-xs text-muted-foreground">
          Время ожидания перед отправкой сообщений
        </p>
      </div>

      {/* Первое сообщение */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Прочтение первого сообщения: {formatDelay(firstValue)}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Время, которое система ждёт перед отправкой первого сообщения,
                имитируя прочтение сообщения пользователя
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Slider
          value={[firstSliderValue]}
          onValueChange={handleFirstSliderChange}
          min={0}
          max={260}
          step={5}
        />
      </div>

      {/* Последующие сообщения */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm">
            Прочтение последующих сообщений: {formatDelay(subsequentValue)}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Время, которое система ждёт перед отправкой каждого последующего сообщения,
                имитируя прочтение предыдущего сообщения пользователем
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Slider
          value={[subsequentSliderValue]}
          onValueChange={handleSubsequentSliderChange}
          min={0}
          max={260}
          step={5}
        />
      </div>
    </div>
  );
}

