'use client';

import { useEffect, useState, memo } from 'react';
import {
  KnowledgeBaseCard,
  useKnowledgeBasesForTenant,
  useKnowledgeBasesLoading,
  useKnowledgeBasesError,
  useKnowledgeBasesActions,
  type KnowledgeBase,
} from '@/entities/knowledge-base';
import { CreateKnowledgeBaseButton } from '@/features/create-knowledge-base';
import { EditKnowledgeBaseDialog } from '@/features/edit-knowledge-base';
import { DeleteKnowledgeBaseDialog } from '@/features/delete-knowledge-base';
import { UploadMaterialsDialog } from '@/features/upload-knowledge-materials';
import { ViewChunksDialog } from '@/features/view-chunks';
import { Skeleton } from '@/shared/ui/components/ui/skeleton';
import { Card, CardHeader } from '@/shared/ui/components/ui/card';
import { EmptyState, EmptyStateIcons } from '@/shared/ui';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface KnowledgeBasesListProps {
  tenantId: string;
}

const MemoizedKnowledgeBaseCard = memo<{
  knowledgeBase: KnowledgeBase;
  onEdit: (kb: KnowledgeBase) => void;
  onDelete: (kb: KnowledgeBase) => void;
  onUploadMaterials: (kb: KnowledgeBase) => void;
  onViewChunks: (kb: KnowledgeBase) => void;
}>(KnowledgeBaseCard);

export function KnowledgeBasesList({ tenantId }: KnowledgeBasesListProps) {
  const knowledgeBases = useKnowledgeBasesForTenant(tenantId);
  const isLoading = useKnowledgeBasesLoading(tenantId);
  const error = useKnowledgeBasesError(tenantId);
  const { loadKnowledgeBases } = useKnowledgeBasesActions();

  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);
  const [deletingKb, setDeletingKb] = useState<KnowledgeBase | null>(null);
  const [uploadingKb, setUploadingKb] = useState<KnowledgeBase | null>(null);
  const [viewingChunksKb, setViewingChunksKb] = useState<KnowledgeBase | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewChunksDialogOpen, setIsViewChunksDialogOpen] = useState(false);

  useEffect(() => {
    loadKnowledgeBases(tenantId);
  }, [tenantId, loadKnowledgeBases]);

  const handleEdit = (kb: KnowledgeBase) => {
    setEditingKb(kb);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (kb: KnowledgeBase) => {
    setDeletingKb(kb);
    setIsDeleteDialogOpen(true);
  };

  const handleUploadMaterials = (kb: KnowledgeBase) => {
    setUploadingKb(kb);
    setIsUploadDialogOpen(true);
  };

  const handleViewChunks = (kb: KnowledgeBase) => {
    setViewingChunksKb(kb);
    setIsViewChunksDialogOpen(true);
  };

  // Состояние загрузки
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

  // Состояние ошибки
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Пустое состояние
  if (knowledgeBases.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.Document}
        title="У вас пока нет баз знаний"
        description="Создайте свою первую базу знаний для хранения и семантического поиска информации"
        action={<CreateKnowledgeBaseButton tenantId={tenantId} />}
      />
    );
  }

  // Список баз знаний
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeBases.map((kb) => (
          <MemoizedKnowledgeBaseCard
            key={kb.id}
            knowledgeBase={kb}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUploadMaterials={handleUploadMaterials}
            onViewChunks={handleViewChunks}
          />
        ))}
      </div>

      <EditKnowledgeBaseDialog
        knowledgeBase={editingKb}
        tenantId={tenantId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      <DeleteKnowledgeBaseDialog
        knowledgeBase={deletingKb}
        tenantId={tenantId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />

      <UploadMaterialsDialog
        knowledgeBase={uploadingKb}
        tenantId={tenantId}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onViewChunks={() => {
          if (uploadingKb) {
            setViewingChunksKb(uploadingKb);
            setIsViewChunksDialogOpen(true);
          }
        }}
      />

      <ViewChunksDialog
        knowledgeBase={viewingChunksKb}
        tenantId={tenantId}
        open={isViewChunksDialogOpen}
        onOpenChange={setIsViewChunksDialogOpen}
      />
    </>
  );
}
