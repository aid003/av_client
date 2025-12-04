'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import {
  SalesScriptCard,
  useSalesScriptsForTenant,
  useSalesScriptsLoading,
  useSalesScriptsError,
  useSalesScriptsActions,
  type SalesScript,
} from '@/entities/sales-script';
import {
  useScriptBindingsActions,
} from '@/entities/sales-script';
import { useAccountsForTenant } from '@/entities/avito-account';
import { CreateSalesScriptButton } from '@/features/create-sales-script';
import { EditSalesScriptDialog } from '@/features/edit-sales-script';
import { DeleteSalesScriptDialog } from '@/features/delete-sales-script';
import { AttachAdsToScriptDialog } from '@/features/link-ads-to-script';
import {
  AttachScriptToAccountDialog,
  DetachAccountConfirmDialog,
} from '@/features/link-script-to-account';
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
  onAttachAds?: (script: SalesScript) => void;
  onAttachToAccount?: (script: SalesScript) => void;
  onDetachFromAccount?: (script: SalesScript) => void;
  accountBinding?: any;
  accountLabel?: string | null;
}>(SalesScriptCard);

export function SalesScriptsList({ tenantId }: SalesScriptsListProps) {
  const scripts = useSalesScriptsForTenant(tenantId);
  const isLoading = useSalesScriptsLoading(tenantId);
  const error = useSalesScriptsError(tenantId);
  const { loadSalesScripts } = useSalesScriptsActions();
  const { loadScriptBindings, getAccountBinding } = useScriptBindingsActions();
  const accounts = useAccountsForTenant(tenantId);

  const [editingScript, setEditingScript] = useState<SalesScript | null>(null);
  const [deletingScript, setDeletingScript] = useState<SalesScript | null>(
    null
  );
  const [attachingScript, setAttachingScript] = useState<SalesScript | null>(
    null
  );
  const [attachingToAccountScript, setAttachingToAccountScript] =
    useState<SalesScript | null>(null);
  const [detachingScript, setDetachingScript] = useState<SalesScript | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [isAttachToAccountDialogOpen, setIsAttachToAccountDialogOpen] =
    useState(false);
  const [isDetachDialogOpen, setIsDetachDialogOpen] = useState(false);

  useEffect(() => {
    loadSalesScripts(tenantId);
  }, [tenantId, loadSalesScripts]);

  // Загружаем привязки для всех скриптов
  useEffect(() => {
    scripts.forEach((script) => {
      loadScriptBindings(script.id, tenantId);
    });
  }, [scripts, tenantId, loadScriptBindings]);

  // Создаем мапу аккаунтов для быстрого поиска
  const accountsMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((account) => {
      map.set(account.id, account.label || `Аккаунт ${account.id}`);
    });
    return map;
  }, [accounts]);

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

  const handleAttachToAccount = (script: SalesScript) => {
    setAttachingToAccountScript(script);
    setIsAttachToAccountDialogOpen(true);
  };

  const handleDetachFromAccount = (script: SalesScript) => {
    setDetachingScript(script);
    setIsDetachDialogOpen(true);
  };

  const handleAttachToAccountSuccess = () => {
    if (attachingToAccountScript) {
      loadScriptBindings(attachingToAccountScript.id, tenantId, true);
    }
  };

  const handleDetachSuccess = () => {
    if (detachingScript) {
      loadScriptBindings(detachingScript.id, tenantId, true);
    }
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
        {scripts.map((script) => {
          const accountBinding = getAccountBinding(script.id, tenantId);
          const accountLabel = accountBinding?.avitoAccountId
            ? accountsMap.get(accountBinding.avitoAccountId) || null
            : null;

          return (
            <MemoizedSalesScriptCard
              key={script.id}
              script={script}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAttachAds={handleAttachAds}
              onAttachToAccount={handleAttachToAccount}
              onDetachFromAccount={handleDetachFromAccount}
              accountBinding={accountBinding}
              accountLabel={accountLabel}
            />
          );
        })}
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

      <AttachScriptToAccountDialog
        script={attachingToAccountScript}
        tenantId={tenantId}
        open={isAttachToAccountDialogOpen}
        onOpenChange={(open) => {
          setIsAttachToAccountDialogOpen(open);
          if (!open) {
            handleAttachToAccountSuccess();
            setAttachingToAccountScript(null);
          }
        }}
      />

      <DetachAccountConfirmDialog
        script={detachingScript}
        binding={
          detachingScript
            ? getAccountBinding(detachingScript.id, tenantId)
            : null
        }
        tenantId={tenantId}
        open={isDetachDialogOpen}
        onOpenChange={(open) => {
          setIsDetachDialogOpen(open);
          if (!open) {
            handleDetachSuccess();
            setDetachingScript(null);
          }
        }}
      />
    </>
  );
}
