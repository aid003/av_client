'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { syncAvitoAds } from '@/shared/lib/api';
import type { AvitoAdsSyncResponse } from '@/entities/avito-ad';

interface SyncAvitoAdsButtonProps {
  tenantId: string;
  onSuccess: () => void;
}

export function SyncAvitoAdsButton({
  tenantId,
  onSuccess,
}: SyncAvitoAdsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AvitoAdsSyncResponse | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setResult(null);

    try {
      const response = await syncAvitoAds(tenantId);
      setResult(response);
      setIsResultOpen(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при синхронизации');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSync}
        disabled={isSyncing}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
      </Button>

      {error && (
        <div className="fixed bottom-4 right-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 shadow-lg max-w-sm">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Синхронизация завершена
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 pt-2">
                {result && (
                  <>
                    <p>{result.message}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">Всего</div>
                        <div className="text-lg">{result.syncedCount}</div>
                      </div>
                      <div className="bg-muted p-2 rounded">
                        <div className="font-medium">Создано</div>
                        <div className="text-lg">{result.createdCount}</div>
                      </div>
                      <div className="bg-muted p-2 rounded col-span-2">
                        <div className="font-medium">Обновлено</div>
                        <div className="text-lg">{result.updatedCount}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsResultOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
