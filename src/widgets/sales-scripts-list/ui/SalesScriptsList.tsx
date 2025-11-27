'use client';

import { useEffect, useState, memo } from 'react';
import {
  SalesScriptCard,
  useSalesScriptsForTenant,
  useSalesScriptsLoading,
  useSalesScriptsError,
  useSalesScriptsActions,
  type SalesScript,
} from '@/entities/sales-script';
import { CreateSalesScriptButton } from '@/features/create-sales-script';
import { EditSalesScriptDialog } from '@/features/edit-sales-script';
import { DeleteSalesScriptDialog } from '@/features/delete-sales-script';
import { AttachAdsToScriptDialog } from '@/features/link-ads-to-script';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardHeader } from '@/shared/ui/components/ui/card';
import { EmptyState, EmptyStateIcons } from '@/shared/ui/empty-state';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SalesScriptsListProps {
  tenantId: string;
}

const MemoizedSalesScriptCard = memo<{
  script: SalesScript;
  onEdit: (script: SalesScript) => void;
  onDelete: (script: SalesScript) => void;
  onAttachAds: (script: SalesScript) => void;
}>(SalesScriptCard);

export function SalesScriptsList({ tenantId }: SalesScriptsListProps) {
  const scripts = useSalesScriptsForTenant(tenantId);
  const isLoading = useSalesScriptsLoading(tenantId);
  const error = useSalesScriptsError(tenantId);
  const { loadSalesScripts } = useSalesScriptsActions();

  const [editingScript, setEditingScript] = useState<SalesScript | null>(null);
  const [deletingScript, setDeletingScript] = useState<SalesScript | null>(
    null
  );
  const [attachingScript, setAttachingScript] = useState<SalesScript | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);

  useEffect(() => {
    loadSalesScripts(tenantId);
  }, [tenantId, loadSalesScripts]);

  const handleEdit = (script: SalesScript) => {
    setEditingScript(script);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (script: SalesScript) => {
    setDeletingScript(script);
    setIsDeleteDialogOpen(true);
  };

  const handleAttachAds = (script: SalesScript) => {
    setAttachingScript(script);
    setIsAttachDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-0">
            <CardHeader className="p-4 border-b">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (scripts.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.Document}
        title="У вас пока нет скриптов продаж"
        description="Создайте свой первый скрипт для автоматизации общения с клиентами"
        action={<CreateSalesScriptButton tenantId={tenantId} />}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <MemoizedSalesScriptCard
            key={script.id}
            script={script}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAttachAds={handleAttachAds}
          />
        ))}
      </div>

      <EditSalesScriptDialog
        script={editingScript}
        tenantId={tenantId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteSalesScriptDialog
        script={deletingScript}
        tenantId={tenantId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />

      <AttachAdsToScriptDialog
        script={attachingScript}
        tenantId={tenantId}
        open={isAttachDialogOpen}
        onOpenChange={setIsAttachDialogOpen}
      />
    </>
  );
}
