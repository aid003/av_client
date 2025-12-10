'use client';

import { useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  LeadListItem,
  useLeadsForTenant,
  useLeadsLoading,
  useLeadsError,
  useLeadPagination,
  useLeadsActions,
  type Lead,
} from '@/entities/lead';
import { usePolling } from '@/shared/lib/use-polling';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { EmptyState } from '@/shared/ui';
import { Button } from '@/shared/ui/components/ui/button';

interface LeadsListProps {
  tenantId: string;
  onLeadSelect?: (lead: Lead) => void;
  selectedLeadId?: string;
}

const POLLING_INTERVAL = 30000; // 30 seconds

function getLeadsCountText(count: number, total: number): string {
  // Если все лиды на одной странице - показываем простой текст с склонением
  if (count === total) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return `${count} лидов`;
    }
    if (lastDigit === 1) {
      return `${count} лид`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${count} лида`;
    }
    return `${count} лидов`;
  }

  // Если есть пагинация - показываем "Показано X из Y"
  return `Показано ${count} из ${total}`;
}

export function LeadsList({
  tenantId,
  onLeadSelect,
  selectedLeadId,
}: LeadsListProps) {
  const leads = useLeadsForTenant(tenantId);
  const isLoading = useLeadsLoading(tenantId);
  const error = useLeadsError(tenantId);
  const pagination = useLeadPagination(tenantId);
  const { loadLeads, refreshLeads } = useLeadsActions();

  useEffect(() => {
    loadLeads(tenantId);
  }, [tenantId, loadLeads]);

  usePolling(() => refreshLeads(tenantId), {
    interval: POLLING_INTERVAL,
    refreshOnFocus: true,
    enabled: !isLoading,
  });

  const handlePageChange = (page: number) => {
    loadLeads(tenantId, { page });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Лиды</h2>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        title="Нет лидов"
        description="Когда появятся лиды, они будут отображаться здесь"
      />
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.perPage);

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {getLeadsCountText(leads.length, pagination.total || leads.length)}
      </p>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className={
              selectedLeadId === lead.id ? 'ring-2 ring-primary rounded-xl' : ''
            }
          >
            <LeadListItem lead={lead} onClick={() => onLeadSelect?.(lead)} />
          </div>
        ))}
      </div>

      {pagination.total > pagination.perPage && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="min-w-[70px]"
          >
            Назад
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2">
            {pagination.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="min-w-[70px]"
          >
            Вперед
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
