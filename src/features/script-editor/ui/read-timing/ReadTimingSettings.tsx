'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import { Slider } from '@/shared/ui/components/ui/slider';

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
  const firstSliderValue = Math.min(firstValue, 300);
  const subsequentSliderValue = Math.min(subsequentValue, 300);

  const handleFirstSliderChange = (values: number[]) => {
    const newValue = values[0] || 0;
    onFirstMessageChange(newValue === 0 ? undefined : newValue);
  };

  const handleFirstInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) {
      onFirstMessageChange(undefined);
    } else {
      onFirstMessageChange(val === 0 ? undefined : val);
    }
  };

  const handleSubsequentSliderChange = (values: number[]) => {
    const newValue = values[0] || 0;
    onSubsequentMessageChange(newValue === 0 ? undefined : newValue);
  };

  const handleSubsequentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) {
      onSubsequentMessageChange(undefined);
    } else {
      onSubsequentMessageChange(val === 0 ? undefined : val);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Задержки времени прочтения</h3>
        <p className="text-xs text-muted-foreground">
          Настройте время, которое система будет ждать перед отправкой следующего сообщения,
          имитируя время прочтения предыдущего сообщения пользователем.
        </p>
      </div>

      {/* Первое сообщение */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Задержка для первого сообщения: {formatDelay(firstMessageDelaySeconds)}</Label>
        </div>
        <Slider
          value={[firstSliderValue]}
          onValueChange={handleFirstSliderChange}
          min={0}
          max={300}
          step={5}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={firstValue}
            onChange={handleFirstInputChange}
            min={0}
            className="w-24 h-8"
          />
          <span className="text-xs text-muted-foreground">секунд</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Время ожидания перед отправкой первого сообщения в диалоге
        </p>
      </div>

      {/* Последующие сообщения */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">
            Задержка для последующих сообщений: {formatDelay(subsequentMessageDelaySeconds)}
          </Label>
        </div>
        <Slider
          value={[subsequentSliderValue]}
          onValueChange={handleSubsequentSliderChange}
          min={0}
          max={300}
          step={5}
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={subsequentValue}
            onChange={handleSubsequentInputChange}
            min={0}
            className="w-24 h-8"
          />
          <span className="text-xs text-muted-foreground">секунд</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Время ожидания перед отправкой каждого последующего сообщения
        </p>
      </div>
    </div>
  );
}

