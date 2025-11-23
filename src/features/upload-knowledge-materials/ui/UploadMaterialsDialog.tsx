'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs';
import { Button } from '@/shared/ui/components/ui/button';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Label } from '@/shared/ui/components/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import {
  Upload,
  FileText,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  uploadText,
  getChunks,
  deleteChunk,
  deleteChunksBatch,
  type KnowledgeBase,
  type Chunk,
  type ChunkListResponseDto,
} from '@/entities/knowledge-base';
import { EditChunkDialog } from './EditChunkDialog';
import { DeleteChunksConfirmDialog } from './DeleteChunksConfirmDialog';

interface UploadMaterialsDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadMaterialsDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: UploadMaterialsDialogProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'chunks'>('upload');
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [chunksError, setChunksError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChunks, setTotalChunks] = useState(0);
  const perPage = 25;

  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingChunks, setDeletingChunks] = useState<Chunk[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Загрузка чанков при открытии диалога или смене страницы
  useEffect(() => {
    if (open && knowledgeBase && activeTab === 'chunks') {
      loadChunks();
    }
  }, [open, knowledgeBase, activeTab, currentPage]);

  const loadChunks = async () => {
    if (!knowledgeBase) return;

    setIsLoadingChunks(true);
    setChunksError(null);

    try {
      const response: ChunkListResponseDto = await getChunks(
        knowledgeBase.id,
        tenantId,
        currentPage,
        perPage
      );

      setChunks(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalChunks(response.meta.total);
    } catch (err) {
      setChunksError(
        err instanceof Error ? err.message : 'Ошибка при загрузке чанков'
      );
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleUpload = async () => {
    if (!knowledgeBase || !text.trim()) {
      setUploadError('Пожалуйста, введите текст для загрузки');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await uploadText(knowledgeBase.id, tenantId, {
        text: text.trim(),
      });

      setUploadSuccess(
        `Успешно загружено! Создано чанков: ${response.totalChunks}`
      );
      setText('');

      // Переключаемся на вкладку с чанками через 1.5 секунды
      setTimeout(() => {
        setActiveTab('chunks');
        setCurrentPage(1);
        setUploadSuccess(null);
      }, 1500);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Ошибка при загрузке текста'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectChunk = (chunkId: string) => {
    const newSelected = new Set(selectedChunkIds);
    if (newSelected.has(chunkId)) {
      newSelected.delete(chunkId);
    } else {
      newSelected.add(chunkId);
    }
    setSelectedChunkIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedChunkIds.size === chunks.length) {
      setSelectedChunkIds(new Set());
    } else {
      setSelectedChunkIds(new Set(chunks.map((c) => c.id)));
    }
  };

  const handleEditChunk = (chunk: Chunk) => {
    setEditingChunk(chunk);
    setIsEditDialogOpen(true);
  };

  const handleDeleteChunk = (chunk: Chunk) => {
    setDeletingChunks([chunk]);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    const chunksToDelete = chunks.filter((c) => selectedChunkIds.has(c.id));
    setDeletingChunks(chunksToDelete);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setSelectedChunkIds(new Set());
    setIsDeleteDialogOpen(false);
    await loadChunks();
  };

  const handleEditConfirmed = async () => {
    setIsEditDialogOpen(false);
    await loadChunks();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const resetState = () => {
    setText('');
    setUploadError(null);
    setUploadSuccess(null);
    setSelectedChunkIds(new Set());
    setCurrentPage(1);
    setActiveTab('upload');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {knowledgeBase?.name} - Управление материалами
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'upload' | 'chunks')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Загрузить
              </TabsTrigger>
              <TabsTrigger value="chunks">
                <FileText className="h-4 w-4 mr-2" />
                Чанки ({totalChunks})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="upload-text">Текст для загрузки</Label>
                <Textarea
                  id="upload-text"
                  placeholder="Вставьте или введите текст, который будет разбит на чанки и добавлен в базу знаний..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isUploading}
                  rows={15}
                  className="resize-none"
                />
              </div>

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {uploadSuccess && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {uploadSuccess}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUpload}
                disabled={isUploading || !text.trim()}
                className="w-full"
              >
                {isUploading ? 'Загрузка...' : 'Загрузить текст'}
              </Button>
            </TabsContent>

            <TabsContent
              value="chunks"
              className="flex-1 flex flex-col overflow-hidden space-y-4"
            >
              {selectedChunkIds.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Выбрано: {selectedChunkIds.size}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить выбранные
                  </Button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3">
                {isLoadingChunks ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : chunksError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{chunksError}</AlertDescription>
                  </Alert>
                ) : chunks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Нет чанков
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Загрузите текст, чтобы создать чанки
                    </p>
                  </div>
                ) : (
                  chunks.map((chunk) => (
                    <Card key={chunk.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedChunkIds.has(chunk.id)}
                            onCheckedChange={() => handleSelectChunk(chunk.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {chunk.text}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatDate(chunk.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEditChunk(chunk)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteChunk(chunk)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoadingChunks}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Страница {currentPage} из {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || isLoadingChunks}
                  >
                    Вперёд
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {chunks.length > 0 && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="w-full"
                  >
                    {selectedChunkIds.size === chunks.length
                      ? 'Снять выделение'
                      : 'Выбрать все на странице'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EditChunkDialog
        chunk={editingChunk}
        knowledgeBase={knowledgeBase}
        tenantId={tenantId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditConfirmed}
      />

      <DeleteChunksConfirmDialog
        chunks={deletingChunks}
        knowledgeBase={knowledgeBase}
        tenantId={tenantId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteConfirmed}
      />
    </>
  );
}
