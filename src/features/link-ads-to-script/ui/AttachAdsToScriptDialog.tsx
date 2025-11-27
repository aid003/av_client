'use client';

import { useEffect, useState } from 'react';
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
import { Switch } from '@/shared/ui/components/ui/switch';
import {
  Search,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getAvitoAds,
  type AvitoAd,
  type AvitoAdsPaginationMeta,
} from '@/entities/avito-ad';
import type { SalesScript, ScriptBinding } from '@/entities/sales-script';
import { useAdScriptBindingActions } from '@/entities/ad-script-binding';
import { ReplaceBindingConfirmDialog } from './ReplaceBindingConfirmDialog';

interface AttachAdsToScriptDialogProps {
  script: SalesScript | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachAdsToScriptDialog({
  script,
  tenantId,
  open,
  onOpenChange,
}: AttachAdsToScriptDialogProps) {
  const [search, setSearch] = useState('');
  const [ads, setAds] = useState<AvitoAd[]>([]);
  const [meta, setMeta] = useState<AvitoAdsPaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: string[];
    failed: Array<{ adId: string; error: string }>;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<
    Array<{
      adId: string;
      adTitle: string;
      existingBinding: ScriptBinding;
    }>
  >([]);
  const [pendingBindingData, setPendingBindingData] = useState<{
    adIds: string[];
  } | null>(null);

  const { attachBindings, checkBindingConflicts, detachBinding } =
    useAdScriptBindingActions();

  const canSubmit = script && selected.size > 0 && !submitting;

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
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке объявлений'
      );
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
      setIsActive(true);
      setSubmitting(false);
      setSubmitResult(null);
      setError(null);
      setShowConfirmDialog(false);
      setConflictInfo([]);
      setPendingBindingData(null);
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

  const executeBinding = async (
    adIdsToProcess: string[],
    deleteOldBindings = false
  ) => {
    if (!script) return;

    setSubmitting(true);
    setSubmitResult(null);

    try {
      // If we need to delete old bindings first
      if (deleteOldBindings && conflictInfo.length > 0) {
        const deletePromises = conflictInfo.map((conflict) =>
          detachBinding(conflict.adId, tenantId, conflict.existingBinding.id).catch(
            (err) => console.error('Failed to delete old binding:', err)
          )
        );
        await Promise.allSettled(deletePromises);
      }

      // Create new bindings
      const res = await attachBindings(adIdsToProcess, tenantId, script.id, isActive);
      setSubmitResult(res);

      // Clear selection if successful
      if (res.success.length > 0) {
        setSelected(new Set());
      }
    } catch (err) {
      setSubmitResult({
        success: [],
        failed: adIdsToProcess.map((adId) => ({
          adId,
          error: err instanceof Error ? err.message : 'Ошибка',
        })),
      });
    } finally {
      setSubmitting(false);
      setShowConfirmDialog(false);
      setPendingBindingData(null);
    }
  };

  const handleConfirmReplace = async () => {
    if (!pendingBindingData) return;
    await executeBinding(pendingBindingData.adIds, true);
  };

  const handleSubmit = async () => {
    if (!script) return;
    const adIds = Array.from(selected);

    setSubmitting(true);
    setSubmitResult(null);

    try {
      // Step 1: Check for conflicts
      const conflicts = await checkBindingConflicts(adIds, tenantId);

      if (conflicts.adsWithExistingBindings.length > 0) {
        // Find ad details for conflict display using already loaded ads
        const conflictDetails = conflicts.adsWithExistingBindings.map((conflict) => {
          const ad = ads.find((a) => a.id === conflict.adId);
          return {
            adId: conflict.adId,
            adTitle: ad?.title || `Объявление ${conflict.adId}`,
            existingBinding: conflict.existingBinding,
          };
        });

        // Store pending data and show confirmation dialog
        setPendingBindingData({ adIds });
        setConflictInfo(conflictDetails);
        setShowConfirmDialog(true);
        setSubmitting(false);
      } else {
        // No conflicts, proceed directly
        await executeBinding(adIds);
      }
    } catch (err) {
      setSubmitResult({
        success: [],
        failed: adIds.map((adId) => ({
          adId,
          error: err instanceof Error ? err.message : 'Ошибка проверки',
        })),
      });
      setSubmitting(false);
    }
  };

  const successCount = submitResult?.success.length ?? 0;
  const failedCount = submitResult?.failed.length ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Привязать объявления</DialogTitle>
          <DialogDescription>
            Скрипт продаж: <Badge variant="secondary">{script?.name}</Badge>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="binding-active">Активна</Label>
            <Switch
              id="binding-active"
              checked={isActive}
              onCheckedChange={setIsActive}
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
                  <div className="text-sm text-muted-foreground">
                    Загрузка...
                  </div>
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
                            <div className="font-medium leading-tight">
                              {ad.title}
                            </div>
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Закрыть
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
            <LinkIcon className="h-4 w-4" />
            {submitting ? 'Привязываю...' : `Привязать (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <ReplaceBindingConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        conflicts={conflictInfo}
        newScript={script}
        onConfirm={handleConfirmReplace}
        isProcessing={submitting}
      />
    </>
  );
}
