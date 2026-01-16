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
import { Badge } from '@/shared/ui/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { BookText, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import type { AvitoAd } from '@/entities/avito-ad';
import {
  useAdKbActions,
  useAdKbError,
  useAdKbLinks,
  useAdKbLoading,
} from '@/entities/ad-knowledge-link/model/store';

interface ViewAdKnowledgeBasesDialogProps {
  ad: AvitoAd | null;
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAdKnowledgeBasesDialog({
  ad,
  tenantId,
  open,
  onOpenChange,
}: ViewAdKnowledgeBasesDialogProps) {
  const adId = ad?.id ?? '';
  const links = useAdKbLinks(adId);
  const loading = useAdKbLoading(adId);
  const error = useAdKbError(adId);
  const { loadLinks, detachLink } = useAdKbActions();

  const isLoading = loading || !Array.isArray(links);
  const [detachingKbId, setDetachingKbId] = useState<string | null>(null);
  const [detachError, setDetachError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKbId, setConfirmKbId] = useState<string | null>(null);
  const [confirmKbName, setConfirmKbName] = useState<string | null>(null);

  useEffect(() => {
    if (open && adId) {
      loadLinks(adId, tenantId, { staleAfterMs: 0 });
    }
  }, [open, adId, tenantId, loadLinks]);

  const handleRefresh = () => {
    if (!adId) return;
    loadLinks(adId, tenantId, { force: true });
  };

  const handleDetach = (kbId: string, kbName: string) => {
    setDetachError(null);
    setConfirmKbId(kbId);
    setConfirmKbName(kbName);
    setConfirmOpen(true);
  };

  const handleConfirmDetach = async () => {
    if (!adId || !confirmKbId) return;
    setDetachError(null);
    try {
      setDetachingKbId(confirmKbId);
      await detachLink(adId, tenantId, confirmKbId);
      setConfirmOpen(false);
      setConfirmKbId(null);
      setConfirmKbName(null);
    } catch (err) {
      setDetachError(err instanceof Error ? err.message : 'Не удалось отвязать базу знаний');
    } finally {
      setDetachingKbId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Базы знаний объявления</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="truncate" title={ad?.title}>
              {ad?.title}
            </span>
            <Badge variant="outline">#{ad?.itemId}</Badge>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {detachError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{detachError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Загрузка…' : `Найдено: ${links.length}`}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Обновить
          </Button>
        </div>

        <ScrollArea className="h-[320px]">
          <div className="space-y-3 py-2">
            {!isLoading && links.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Нет привязанных баз знаний
              </div>
            ) : (
              Array.isArray(links) &&
              links.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookText className="h-4 w-4 text-primary shrink-0" />
                    <div className="truncate" title={l.knowledgeBaseName}>
                      {l.knowledgeBaseName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">Приоритет {l.priority}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8"
                      onClick={() => handleDetach(l.knowledgeBaseId, l.knowledgeBaseName)}
                      disabled={detachingKbId === l.knowledgeBaseId}
                      title="Отвязать базу знаний"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Отвязать
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      {/* Confirm detach dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Отвязать базу знаний?</DialogTitle>
            <DialogDescription>
              Вы действительно хотите отвязать базу знаний
              {confirmKbName ? ` «${confirmKbName}» ` : ' '}
              от этого объявления?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDetach}
              disabled={!!detachingKbId}
            >
              Отвязать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

