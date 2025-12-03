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
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
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
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Лиды</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Показано {leads.length} из {pagination.total}
        </p>
      </div>

      <div className="flex flex-col gap-2">
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
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {pagination.page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
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
