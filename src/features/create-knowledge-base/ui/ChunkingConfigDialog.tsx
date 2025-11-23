'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import type { ChunkingConfig } from '@/entities/knowledge-base';

interface ChunkingConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ChunkingConfig;
  onConfigChange: (config: ChunkingConfig) => void;
  onBack: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function ChunkingConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  onBack,
  onSave,
  isLoading = false,
}: ChunkingConfigDialogProps) {
  const handleMethodChange = (value: string) => {
    onConfigChange({ ...config, method: value });
  };

  const handleMaxChunkSizeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onConfigChange({ ...config, maxChunkSize: num });
    }
  };

  const handleMinChunkSizeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onConfigChange({ ...config, minChunkSize: num });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройка параметров чанкинга</DialogTitle>
          <DialogDescription>
            Настройте способ разбиения текста на фрагменты для векторного поиска
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="method">Метод чанкинга</Label>
            <Select
              value={config.method}
              onValueChange={handleMethodChange}
              disabled={isLoading}
            >
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semantic">Семантический</SelectItem>
                <SelectItem value="fixed">Фиксированный размер</SelectItem>
                <SelectItem value="sentence">По предложениям</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxChunkSize">
                Макс. размер (символов)
              </Label>
              <Input
                id="maxChunkSize"
                type="number"
                value={config.maxChunkSize}
                onChange={(e) => handleMaxChunkSizeChange(e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minChunkSize">
                Мин. размер (символов)
              </Label>
              <Input
                id="minChunkSize"
                type="number"
                value={config.minChunkSize}
                onChange={(e) => handleMinChunkSizeChange(e.target.value)}
                disabled={isLoading}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Опции разбиения</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="splitOnParagraphs"
                checked={config.splitOnParagraphs}
                onCheckedChange={(checked) =>
                  onConfigChange({ ...config, splitOnParagraphs: checked === true })
                }
                disabled={isLoading}
              />
              <Label htmlFor="splitOnParagraphs" className="text-sm font-normal cursor-pointer">
                Разбивать по абзацам
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="splitOnSentences"
                checked={config.splitOnSentences}
                onCheckedChange={(checked) =>
                  onConfigChange({ ...config, splitOnSentences: checked === true })
                }
                disabled={isLoading}
              />
              <Label htmlFor="splitOnSentences" className="text-sm font-normal cursor-pointer">
                Разбивать по предложениям
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserveParagraphs"
                checked={config.preserveParagraphs}
                onCheckedChange={(checked) =>
                  onConfigChange({ ...config, preserveParagraphs: checked === true })
                }
                disabled={isLoading}
              />
              <Label htmlFor="preserveParagraphs" className="text-sm font-normal cursor-pointer">
                Сохранять абзацы целиком
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mergeSmallChunks"
                checked={config.mergeSmallChunks}
                onCheckedChange={(checked) =>
                  onConfigChange({ ...config, mergeSmallChunks: checked === true })
                }
                disabled={isLoading}
              />
              <Label htmlFor="mergeSmallChunks" className="text-sm font-normal cursor-pointer">
                Объединять маленькие чанки
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Назад
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
