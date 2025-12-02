'use client';

import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import { Slider } from '@/shared/ui/components/ui/slider';

interface DelaySecondsInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

function formatDelay(seconds: number | undefined): string {
  if (seconds === undefined || seconds === 0) return 'сразу';
  if (seconds < 60) return `${seconds} сек`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) return `${minutes} мин`;
  return `${minutes} мин ${remainingSeconds} сек`;
}

export function DelaySecondsInput({ value, onChange }: DelaySecondsInputProps) {
  const currentValue = value ?? 0;
  const sliderValue = Math.min(currentValue, 300);

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0] || 0;
    onChange(newValue === 0 ? undefined : newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val) || val < 0) {
      onChange(undefined);
    } else {
      onChange(val === 0 ? undefined : val);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Задержка перед отправкой: {formatDelay(value)}</Label>
      </div>

      <Slider
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        min={0}
        max={300}
        step={5}
      />

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={currentValue}
          onChange={handleInputChange}
          min={0}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">секунд</span>
      </div>
    </div>
  );
}
