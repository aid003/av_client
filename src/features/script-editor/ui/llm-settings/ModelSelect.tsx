'use client';

import { useEffect, useState } from 'react';
import type React from 'react';
import { Label } from '@/shared/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Button } from '@/shared/ui/components/ui/button';
import { getLlmMetadata } from '@/entities/sales-script/api';
import type { LlmModelInfo } from '@/entities/sales-script';

interface ModelSelectProps {
  /**
   * ID выбранной модели
   */
  value?: string;

  /**
   * Callback при изменении модели
   */
  onChange: (modelId: string | undefined) => void;

  /**
   * Модель по умолчанию (из глобальных настроек)
   */
  defaultModel?: string;

  /**
   * Label для поля
   */
  label?: React.ReactNode;

  /**
   * Placeholder
   */
  placeholder?: string;

  /**
   * Показывать ли badge с текущим статусом (Custom / Default)
   */
  showBadge?: boolean;

  /**
   * Показывать ли кнопку Reset
   */
  showReset?: boolean;
}

export function ModelSelect({
  value,
  onChange,
  defaultModel,
  label = 'Модель',
  placeholder = 'Выберите модель',
  showBadge = true,
  showReset = true,
}: ModelSelectProps) {
  const [models, setModels] = useState<LlmModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLlmMetadata()
      .then((metadata) => {
        setModels(metadata.availableModels);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load LLM metadata:', error);
        setLoading(false);
      });
  }, []);

  const isUsingDefault = !value && defaultModel;
  const isCustom = value && value !== defaultModel;
  const currentValue = value || defaultModel;

  const currentModel = models.find((m) => m.id === currentValue);

  const handleReset = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {typeof label === 'string' ? <Label>{label}</Label> : label}
        {showBadge && (
          <Badge variant={isCustom ? 'default' : 'secondary'} className="text-xs">
            {isCustom ? 'Custom' : isUsingDefault ? 'Default' : 'Not set'}
          </Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Select
          value={currentValue}
          onValueChange={onChange}
          disabled={loading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? 'Загрузка...' : placeholder}>
              {currentModel ? currentModel.name : placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showReset && value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Сбросить к значению по умолчанию"
          >
            Reset
          </Button>
        )}
      </div>

      {currentModel && (
        <p className="text-xs text-muted-foreground">
          {currentModel.description}
        </p>
      )}
    </div>
  );
}
