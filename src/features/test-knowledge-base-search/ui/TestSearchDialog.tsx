'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Label } from '@/shared/ui/components/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Slider } from '@/shared/ui/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/shared/ui/components/ui/tooltip';
import {
  Search,
  AlertCircle,
  FileSearch,
  HelpCircle,
} from 'lucide-react';
import type {
  KnowledgeBase,
  ChunkSearchResultDto,
  FusionType,
} from '@/entities/knowledge-base';
import { searchKnowledgeBase } from '../api/searchKnowledgeBase';

interface TestSearchDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestSearchDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: TestSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(4);
  const [alpha, setAlpha] = useState(0.5);
  const [fusionType, setFusionType] = useState<FusionType>('RelativeScore');
  const [results, setResults] = useState<ChunkSearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !knowledgeBase) return;

    // CUID валидация
    const cuidPattern = /^c[a-z0-9]{24}$/;
    if (!cuidPattern.test(knowledgeBase.id)) {
      setError(`Некорректный ID базы знаний: ${knowledgeBase.id}`);
      return;
    }

    if (!cuidPattern.test(tenantId)) {
      setError(`Некорректный ID тенанта: ${tenantId}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchKnowledgeBase(tenantId, {
        query: query.trim(),
        knowledgeBaseIds: [knowledgeBase.id],
        limit: limit,
        alpha: alpha,
        fusionType: fusionType,
      });

      setResults(response?.chunks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlphaHint = (value: number): string => {
    if (value <= 0.3) return 'Приоритет: точное совпадение ключевых слов';
    if (value <= 0.6) return 'Сбалансированный поиск: ключевые слова + смысл';
    return 'Приоритет: семантическая близость по смыслу';
  };

  const resetState = () => {
    setQuery('');
    setLimit(4);
    setAlpha(0.5);
    setFusionType('RelativeScore');
    setResults([]);
    setError(null);
    setHasSearched(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[calc(90vh-2rem)]">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>
              FAQ - Тестирование поиска
            </DialogTitle>
          </DialogHeader>

          {/* Объединённый скроллируемый контейнер */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Input Section */}
            <div className="px-6 pb-4">
              <div className="space-y-4 border-b pb-4">
            <div className="space-y-2">
              <Label htmlFor="query">Поисковый запрос</Label>
              <Textarea
                id="query"
                placeholder="Введите вопрос для поиска... (например: 'Какая цена доставки?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-1">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="fusionType">Метод слияния</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p><strong>Relative Score:</strong> Нормализует оценки векторного и keyword поиска относительно друг друга</p>
                      <p className="mt-1"><strong>Ranked:</strong> Объединяет результаты на основе их позиций в каждом списке</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={fusionType} onValueChange={(v) => setFusionType(v as FusionType)}>
                  <SelectTrigger id="fusionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RelativeScore">Relative Score</SelectItem>
                    <SelectItem value="Ranked">Ranked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alpha">Баланс поиска (Alpha)</Label>
                  <span className="text-sm text-muted-foreground">{alpha.toFixed(2)}</span>
                </div>
                <Slider
                  id="alpha"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[alpha]}
                  onValueChange={(v) => setAlpha(v[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {getAlphaHint(alpha)}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isLoading}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isLoading ? 'Поиск...' : 'Найти'}
              </Button>
            </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-3 px-6 pt-4 pb-6">
            {/* Statistics */}
            {hasSearched && !isLoading && !error && Array.isArray(results) && results.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b">
                <Badge variant="outline" className="font-normal">
                  Найдено: {results.length} {results.length === 1 ? 'чанк' : 'чанков'}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Эти {results.length} {results.length === 1 ? 'чанк' : 'чанков'} будут использоваться для формирования ответа на вопрос клиента.</p>
                    <p className="mt-2">Если в списке нет чанка с нужной информацией, рекомендуется переформулировать текст в соответствующем чанке базы знаний, чтобы он лучше соответствовал поисковому запросу.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Empty State - Initial */}
            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Введите запрос для тестирования поиска
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Проверьте, какие чанки будут найдены по вашему вопросу
                </p>
              </div>
            )}

            {/* Empty State - No Results */}
            {hasSearched && !isLoading && !error && Array.isArray(results) && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Ничего не найдено
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить поисковый запрос
                </p>
              </div>
            )}

            {/* Results List */}
            {hasSearched && !isLoading && !error && Array.isArray(results) && results.length > 0 && (
              <>
                {results.map((result, index) => (
                  <Card key={`${result.knowledgeBaseId}-${result.chunkIndex}`} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      {/* Score and Metadata Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={result.score >= 0.7 ? 'default' : 'secondary'}
                            className="font-normal"
                          >
                            {(result.score * 100).toFixed(1)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1} · Чанк {result.chunkIndex}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.text.length} симв.
                        </span>
                      </div>

                      {/* Chunk Text */}
                      <p className="text-sm whitespace-pre-wrap break-words bg-muted/30 p-3 rounded-md">
                        {result.text}
                      </p>

                      {/* Footer Metadata */}
                      <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.knowledgeBaseName}</span>
                          {result.avitoAdId && (
                            <>
                              <span>•</span>
                              <span>ID объявления: {result.avitoAdId}</span>
                            </>
                          )}
                        </div>
                        <span className="font-mono text-[10px]">{result.knowledgeBaseId}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
