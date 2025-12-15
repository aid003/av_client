'use client';

import { Calendar } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function DateFilter({ value, onChange, label = 'Дата регистрации (от)' }: DateFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Convert to ISO format
      const date = new Date(dateValue);
      onChange(date.toISOString());
    } else {
      onChange('');
    }
  };

  // Convert ISO to datetime-local format
  const localValue = value
    ? new Date(value).toISOString().slice(0, 16)
    : '';

  return (
    <div className="space-y-2">
      <Label htmlFor="date-filter" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {label}
      </Label>
      <Input
        id="date-filter"
        type="datetime-local"
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
}
