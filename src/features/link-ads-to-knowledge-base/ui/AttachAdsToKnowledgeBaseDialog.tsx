'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Label } from '@/shared/ui/components/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Card } from '@/shared/ui/components/ui/card';
import { Search, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getAvitoAds,
  type AvitoAd,
  type AvitoAdsPaginationMeta,
} from '@/entities/avito-ad';
import { type KnowledgeBase } from '@/entities/knowledge-base';
import { useAdKbActions } from '@/entities/ad-knowledge-link/model/store';

interface AttachAdsToKnowledgeBaseDialogProps {
  knowledgeBase: KnowledgeBase | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachAdsToKnowledgeBaseDialog({
  knowledgeBase,
  tenantId,
  open,
  onOpenChange,
}: AttachAdsToKnowledgeBaseDialogProps) {
  const [search, setSearch] = useState('');
  const [ads, setAds] = useState<AvitoAd[]>([]);
  const [meta, setMeta] = useState<AvitoAdsPaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [priority, setPriority] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: string[];
    failed: Array<{ adId: string; error: string }>;
  } | null>(null);

  const { attachLinks } = useAdKbActions();

  const canSubmit = knowledgeBase && selected.size > 0 && !submitting;

  const loadAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getAvitoAds(tenantId, {
        page: 1,
        perPage: 25,
        status: 'ACTIVE',
        search: search.trim() || undefined,
      });
      setAds(resp.data);
      setMeta(resp.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке объявлений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAds();
    } else {
      // reset
      setSearch('');
      setAds([]);
      setMeta(null);
      setSelected(new Set());
      setPriority(1);
      setSubmitting(false);
      setSubmitResult(null);
      setError(null);
    }
  }, [open]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!knowledgeBase) return;
    const adIds = Array.from(selected);
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await attachLinks(adIds, tenantId, knowledgeBase.id, priority || 1);
      setSubmitResult(res);
    } catch (err) {
      setSubmitResult({
        success: [],
        failed: adIds.map((adId) => ({
          adId,
          error: err instanceof Error ? err.message : 'Ошибка',
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const successCount = submitResult?.success.length ?? 0;
  const failedCount = submitResult?.failed.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Привязать объявления</DialogTitle>
          <DialogDescription>
            База знаний: <Badge variant="secondary">{knowledgeBase?.name}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию объявления"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadAds();
                }}
                className="pl-8"
                disabled={loading}
              />
            </div>
            <Button variant="outline" onClick={loadAds} disabled={loading}>
              Найти
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="priority" className="min-w-20">
              Приоритет
            </Label>
            <Input
              id="priority"
              type="number"
              min={1}
              value={priority}
              onChange={(e) => setPriority(Math.max(1, Number(e.target.value) || 1))}
              className="w-24"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-0">
            <ScrollArea className="h-[340px]">
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Загрузка...</div>
                ) : ads.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Объявления не найдены
                  </div>
                ) : (
                  ads.map((ad) => {
                    const checked = selected.has(ad.id);
                    return (
                      <label
                        key={ad.id}
                        className="flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleSelect(ad.id)}
                          />
                          <div className="space-y-1">
                            <div className="font-medium leading-tight">{ad.title}</div>
                            <div className="text-xs text-muted-foreground">
                              #{ad.itemId} — {ad.category.name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{ad.price} ₽</Badge>
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>

          {submitResult && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Успешно: {successCount}
                {failedCount > 0 && (
                  <span className="ml-3 text-red-600 dark:text-red-400">
                    Ошибки: {failedCount}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Закрыть
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
            <LinkIcon className="h-4 w-4" />
            {submitting ? 'Привязываю...' : `Привязать (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


