'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Badge } from '@/shared/ui/components/ui/badge';
import {
  Search,
  FileText,
  AlertCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  getChunks,
  type KnowledgeBase,
  type Chunk,
  type ChunkListResponseDto,
} from '@/entities/knowledge-base';
import { EditChunkDialog } from '@/features/upload-knowledge-materials/ui/EditChunkDialog';
import { DeleteChunksConfirmDialog } from '@/features/upload-knowledge-materials/ui/DeleteChunksConfirmDialog';

interface ViewChunksDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewChunksDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: ViewChunksDialogProps) {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChunks, setTotalChunks] = useState(0);
  const perPage = 25;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChunkIds, setSelectedChunkIds] = useState<Set<string>>(new Set());
  const [editingChunk, setEditingChunk] = useState<Chunk | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingChunks, setDeletingChunks] = useState<Chunk[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Загрузка чанков при открытии диалога или смене страницы
  useEffect(() => {
    if (open && knowledgeBase) {
      loadChunks();
    }
  }, [open, knowledgeBase, currentPage]);

  // Сброс страницы при изменении поиска
  useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const loadChunks = async () => {
    if (!knowledgeBase || !knowledgeBase.id) {
      console.error('[ViewChunksDialog] knowledgeBase или knowledgeBase.id отсутствует');
      return;
    }

    // Валидация CUID формата
    const cuidPattern = /^c[a-z0-9]{24}$/;
    if (!cuidPattern.test(knowledgeBase.id)) {
      const errorMsg = `Некорректный ID базы знаний: ${knowledgeBase.id}`;
      console.error('[ViewChunksDialog]', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!cuidPattern.test(tenantId)) {
      const errorMsg = `Некорректный ID тенанта: ${tenantId}`;
      console.error('[ViewChunksDialog]', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

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
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке чанков'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация чанков по поисковому запросу
  const filteredChunks = useMemo(() => {
    if (!searchQuery.trim()) {
      return chunks;
    }
    const query = searchQuery.toLowerCase();
    return chunks.filter((chunk) =>
      chunk.text.toLowerCase().includes(query)
    );
  }, [chunks, searchQuery]);

  // Статистика
  const statistics = useMemo(() => {
    if (chunks.length === 0) {
      return { avgSize: 0, minSize: 0, maxSize: 0 };
    }
    const sizes = chunks.map((c) => c.text.length);
    const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    return { avgSize, minSize, maxSize };
  }, [chunks]);

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
    if (selectedChunkIds.size === filteredChunks.length) {
      setSelectedChunkIds(new Set());
    } else {
      setSelectedChunkIds(new Set(filteredChunks.map((c) => c.id)));
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
    const chunksToDelete = filteredChunks.filter((c) => selectedChunkIds.has(c.id));
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
    setSearchQuery('');
    setSelectedChunkIds(new Set());
    setCurrentPage(1);
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
              {knowledgeBase?.name} - Управление чанками
            </DialogTitle>
            <DialogDescription>
              Просмотр, редактирование и удаление чанков базы знаний
            </DialogDescription>
          </DialogHeader>

          {/* Статистика */}
          {!isLoading && chunks.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pb-2 border-b">
              <Badge variant="outline" className="font-normal">
                Всего: {totalChunks}
              </Badge>
              <Badge variant="outline" className="font-normal">
                Средний размер: {statistics.avgSize} симв.
              </Badge>
              <Badge variant="outline" className="font-normal">
                Диапазон: {statistics.minSize}-{statistics.maxSize} симв.
              </Badge>
            </div>
          )}

          {/* Поиск */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по тексту чанков..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredChunks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="shrink-0"
              >
                {selectedChunkIds.size === filteredChunks.length
                  ? 'Снять выделение'
                  : searchQuery
                    ? 'Выбрать все (поиск)'
                    : 'Выбрать все'}
              </Button>
            )}
          </div>

          {/* Кнопка удаления выбранных */}
          {selectedChunkIds.size > 0 && (
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                Выбрано: {selectedChunkIds.size}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            </div>
          )}

          {/* Список чанков */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
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
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredChunks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {searchQuery ? 'Ничего не найдено' : 'Нет чанков'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Загрузите текст, чтобы создать чанки'}
                </p>
              </div>
            ) : (
              filteredChunks.map((chunk) => (
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
                          <span>•</span>
                          <span>{chunk.text.length} симв.</span>
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

          {/* Пагинация */}
          {totalPages > 1 && !searchQuery && (
            <div className="flex items-center justify-between gap-2 border-t pt-3 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
              <span className="text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || isLoading}
                className="gap-1"
              >
                Вперёд
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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
