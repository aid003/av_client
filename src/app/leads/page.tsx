'use client';

import { useState, useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { LeadsList } from '@/widgets/leads-list';
import { LeadDetailView } from '@/widgets/lead-detail-view';
import { LeadFilters } from '@/features/lead-filters';
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/components/ui/sheet';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useSidebar } from '@/shared/ui/components/ui/sidebar';
import type { Lead } from '@/entities/lead';
import { useSalesScriptsActions } from '@/entities/sales-script';

export default function LeadsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const isMobile = useIsMobile();
  const { open, setOpen } = useSidebar();
  const hasClosedSidebarRef = useRef(false);
  const { loadSalesScripts } = useSalesScriptsActions();

  const tenantId = authData?.tenant.id;

  // Load sales scripts for filters
  useEffect(() => {
    if (tenantId) {
      loadSalesScripts(tenantId);
    }
  }, [tenantId, loadSalesScripts]);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseLead = () => {
    setSelectedLead(null);
  };

  // Close sidebar on mount
  useEffect(() => {
    if (!hasClosedSidebarRef.current && open) {
      setOpen(false);
      hasClosedSidebarRef.current = true;
    }

    return () => {
      setSelectedLead(null);
      hasClosedSidebarRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  // Mobile version: list or Sheet with detail
  if (isMobile) {
    return (
      <>
        <div className="h-[calc(var(--app-dvh,100dvh)-3rem)] flex flex-col overflow-hidden">
          {!selectedLead && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Лиды</h1>
              <LeadFilters tenantId={tenantId!} />
              <LeadsList
                tenantId={tenantId!}
                onLeadSelect={handleLeadSelect}
                selectedLeadId={undefined}
              />
            </div>
          )}
        </div>
        <Sheet
          open={!!selectedLead}
          onOpenChange={(open) => !open && handleCloseLead()}
        >
          <SheetContent
            side="right"
            className="w-full p-0 flex flex-col gap-0 h-full overflow-x-hidden"
          >
            <SheetTitle className="sr-only">Лид</SheetTitle>
            {selectedLead && (
              <div className="flex-1 flex flex-col min-h-0">
                <LeadDetailView
                  lead={selectedLead}
                  onBack={handleCloseLead}
                  showBackButton={true}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop version: two-panel layout
  return (
    <div className="h-[calc(var(--app-dvh,100dvh)-max(2rem,calc(env(safe-area-inset-top,0px)+0.5rem)))] md:h-[calc(var(--app-dvh,100dvh)-3rem)] flex overflow-hidden">
      {/* Left panel with filters and list */}
      <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 border-r flex flex-col overflow-hidden">
        <div className="p-3 md:p-4 border-b space-y-3 md:space-y-4 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold">Лиды</h1>
          <LeadFilters tenantId={tenantId!} />
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          <LeadsList
            tenantId={tenantId!}
            onLeadSelect={handleLeadSelect}
            selectedLeadId={selectedLead?.id}
          />
        </div>
      </div>

      {/* Right panel with detail view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedLead ? (
          <LeadDetailView lead={selectedLead} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="text-center space-y-3 md:space-y-4 px-4">
              <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                Выберите лид
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Выберите лид из списка слева, чтобы просмотреть детали
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
