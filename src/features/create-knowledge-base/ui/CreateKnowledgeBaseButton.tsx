'use client';

import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import {
  createKnowledgeBase,
  useKnowledgeBasesActions,
  type ChunkingConfig,
} from '@/entities/knowledge-base';
import { ChunkingConfigDialog } from './ChunkingConfigDialog';

interface CreateKnowledgeBaseButtonProps {
  tenantId: string;
}

export function CreateKnowledgeBaseButton({
  tenantId,
}: CreateKnowledgeBaseButtonProps) {
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isChunkingDialogOpen, setIsChunkingDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [configureChunking, setConfigureChunking] = useState(false);
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

  const { addKnowledgeBase } = useKnowledgeBasesActions();

  const resetForm = () => {
    setName('');
    setDescription('');
    setConfigureChunking(false);
    setChunkingConfig({
      method: 'semantic',
      maxChunkSize: 1000,
      minChunkSize: 200,
      splitOnParagraphs: true,
      splitOnSentences: true,
      preserveParagraphs: true,
      mergeSmallChunks: true,
    });
    setError(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Пожалуйста, введите название базы знаний');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newKb = await createKnowledgeBase(tenantId, {
        name: name.trim(),
        description: description.trim() || undefined,
        chunkingConfig,
      });

      addKnowledgeBase(tenantId, newKb);
      setIsMainDialogOpen(false);
      setIsChunkingDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка при создании базы знаний'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      setError('Пожалуйста, введите название базы знаний');
      return;
    }

    if (configureChunking) {
      setIsMainDialogOpen(false);
      setIsChunkingDialogOpen(true);
    } else {
      handleCreate();
    }
  };

  const handleBackToMain = () => {
    setIsChunkingDialogOpen(false);
    setIsMainDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsMainDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <>
      <Button onClick={() => setIsMainDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Создать базу знаний
      </Button>

      <Dialog open={isMainDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать базу знаний</DialogTitle>
            <DialogDescription>
              Введите название и описание для новой базы знаний
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name">Название</Label>
              <Input
                id="kb-name"
                placeholder="Например: Документация продукта"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && name.trim()) {
                    handleNext();
                  }
                }}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kb-description">Описание (опционально)</Label>
              <Textarea
                id="kb-description"
                placeholder="Краткое описание базы знаний"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="configure-chunking"
                checked={configureChunking}
                onCheckedChange={(checked) =>
                  setConfigureChunking(checked === true)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="configure-chunking"
                className="text-sm font-normal cursor-pointer"
              >
                Настроить параметры чанкинга
              </Label>
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
              onClick={() => setIsMainDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button onClick={handleNext} disabled={isLoading || !name.trim()}>
              {isLoading
                ? 'Загрузка...'
                : configureChunking
                ? 'Далее'
                : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChunkingConfigDialog
        open={isChunkingDialogOpen}
        onOpenChange={setIsChunkingDialogOpen}
        config={chunkingConfig}
        onConfigChange={setChunkingConfig}
        onBack={handleBackToMain}
        onSave={handleCreate}
        isLoading={isLoading}
      />
    </>
  );
}
