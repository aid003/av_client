'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';
import { LeadCard, type Lead } from '@/entities/lead';
import { EditLeadDialog } from '@/features/edit-lead';
import { DeleteLeadButton } from '@/features/delete-lead';

interface LeadDetailViewProps {
  lead: Lead;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function LeadDetailView({
  lead,
  onBack,
  showBackButton = false,
}: LeadDetailViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {showBackButton && (
        <div className="px-4 py-3 border-b shrink-0">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <LeadCard lead={lead} showChatLink={true} />

        {/* Actions */}
        <div className="flex gap-2">
          <EditLeadDialog lead={lead} tenantId={lead.tenantId} />
          <DeleteLeadButton
            lead={lead}
            tenantId={lead.tenantId}
            onDeleted={onBack}
          />
        </div>
      </div>
    </div>
  );
}
