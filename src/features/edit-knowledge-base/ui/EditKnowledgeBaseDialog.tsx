'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import {
  updateKnowledgeBase,
  useKnowledgeBasesActions,
  type KnowledgeBase,
  type ChunkingConfig,
} from '@/entities/knowledge-base';

interface EditKnowledgeBaseDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditKnowledgeBaseDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: EditKnowledgeBaseDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chunkingConfig, setChunkingConfig] = useState<ChunkingConfig>({
    method: 'semantic',
    maxChunkSize: 1000,
    minChunkSize: 200,
    splitOnParagraphs: true,
    splitOnSentences: true,
    preserveParagraphs: true,
    mergeSmallChunks: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateKnowledgeBase: updateKbInStore } = useKnowledgeBasesActions();

  useEffect(() => {
    if (knowledgeBase) {
      setName(knowledgeBase.name);
      setDescription(knowledgeBase.description || '');
      setChunkingConfig(knowledgeBase.chunkingConfig);
    }
  }, [knowledgeBase]);

  const handleUpdate = async () => {
    if (!knowledgeBase) return;

    if (!name.trim()) {
      setError('Пожалуйста, введите название базы знаний');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedKb = await updateKnowledgeBase(
        knowledgeBase.id,
        tenantId,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          chunkingConfig,
        }
      );

      updateKbInStore(tenantId, updatedKb);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка при обновлении базы знаний'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodChange = (value: string) => {
    setChunkingConfig({ ...chunkingConfig, method: value });
  };

  const handleMaxChunkSizeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setChunkingConfig({ ...chunkingConfig, maxChunkSize: num });
    }
  };

  const handleMinChunkSizeChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setChunkingConfig({ ...chunkingConfig, minChunkSize: num });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать базу знаний</DialogTitle>
          <DialogDescription>
            Измените название, описание и настройки чанкинга
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-kb-name">Название</Label>
            <Input
              id="edit-kb-name"
              placeholder="Например: Документация продукта"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-kb-description">
              Описание (опционально)
            </Label>
            <Textarea
              id="edit-kb-description"
              placeholder="Краткое описание базы знаний"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium">Настройки чанкинга</h4>

            <div className="space-y-2">
              <Label htmlFor="edit-method">Метод чанкинга</Label>
              <Select
                value={chunkingConfig.method}
                onValueChange={handleMethodChange}
                disabled={isLoading}
              >
                <SelectTrigger id="edit-method">
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
                <Label htmlFor="edit-maxChunkSize">
                  Макс. размер (символов)
                </Label>
                <Input
                  id="edit-maxChunkSize"
                  type="number"
                  value={chunkingConfig.maxChunkSize}
                  onChange={(e) => handleMaxChunkSizeChange(e.target.value)}
                  disabled={isLoading}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-minChunkSize">
                  Мин. размер (символов)
                </Label>
                <Input
                  id="edit-minChunkSize"
                  type="number"
                  value={chunkingConfig.minChunkSize}
                  onChange={(e) => handleMinChunkSizeChange(e.target.value)}
                  disabled={isLoading}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Опции разбиения</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-splitOnParagraphs"
                  checked={chunkingConfig.splitOnParagraphs}
                  onCheckedChange={(checked) =>
                    setChunkingConfig({ ...chunkingConfig, splitOnParagraphs: checked === true })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="edit-splitOnParagraphs" className="text-sm font-normal cursor-pointer">
                  Разбивать по абзацам
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-splitOnSentences"
                  checked={chunkingConfig.splitOnSentences}
                  onCheckedChange={(checked) =>
                    setChunkingConfig({ ...chunkingConfig, splitOnSentences: checked === true })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="edit-splitOnSentences" className="text-sm font-normal cursor-pointer">
                  Разбивать по предложениям
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-preserveParagraphs"
                  checked={chunkingConfig.preserveParagraphs}
                  onCheckedChange={(checked) =>
                    setChunkingConfig({ ...chunkingConfig, preserveParagraphs: checked === true })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="edit-preserveParagraphs" className="text-sm font-normal cursor-pointer">
                  Сохранять абзацы целиком
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-mergeSmallChunks"
                  checked={chunkingConfig.mergeSmallChunks}
                  onCheckedChange={(checked) =>
                    setChunkingConfig({ ...chunkingConfig, mergeSmallChunks: checked === true })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="edit-mergeSmallChunks" className="text-sm font-normal cursor-pointer">
                  Объединять маленькие чанки
                </Label>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
