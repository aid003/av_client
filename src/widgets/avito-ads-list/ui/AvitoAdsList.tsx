'use client';

import { useEffect } from 'react';
import { Package } from 'lucide-react';
import { AvitoAdCard, useInfiniteAds } from '@/entities/avito-ad';
import { SyncAvitoAdsButton } from '@/features/sync-avito-ads';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Button } from '@/shared/ui/components/ui/button';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card';

interface AvitoAdsListProps {
  tenantId: string;
}

export function AvitoAdsList({ tenantId }: AvitoAdsListProps) {
  const {
    ads,
    meta,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadInitial,
    loadMore,
    refresh,
  } = useInfiniteAds(tenantId);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleSyncSuccess = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && ads.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Объявления</h2>
          <SyncAvitoAdsButton tenantId={tenantId} onSuccess={handleSyncSuccess} />
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Объявления</h1>
            <p className="text-muted-foreground">
              Активные объявления на Avito
            </p>
          </div>
          <SyncAvitoAdsButton tenantId={tenantId} onSuccess={handleSyncSuccess} />
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Нет активных объявлений
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Синхронизируйте объявления с Avito, чтобы увидеть их здесь
                </p>
              </div>
              <SyncAvitoAdsButton tenantId={tenantId} onSuccess={handleSyncSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Объявления</h2>
          {meta && (
            <p className="text-sm text-muted-foreground mt-1">
              Показано {ads.length} из {meta.total}
            </p>
          )}
        </div>
        <SyncAvitoAdsButton tenantId={tenantId} onSuccess={handleSyncSuccess} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <AvitoAdCard key={ad.id} ad={ad} />
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            size="lg"
          >
            {isLoadingMore ? 'Загрузка...' : 'Загрузить ещё'}
          </Button>
        </div>
      )}
    </div>
  );
}
