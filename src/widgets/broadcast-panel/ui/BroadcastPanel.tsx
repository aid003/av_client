'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { useTelegramInitData } from '@/shared/lib/use-telegram-init-data';
import { Button } from '@/shared/ui/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/components/ui/sheet';
import { Send, X } from 'lucide-react';
import {
  useTenantSearchUsers,
  useTenantSearchMeta,
  useTenantSearchLoading,
  useTenantSearchLoadingMore,
  useTenantSearchHasMore,
  useTenantSearchError,
  useTenantSearchFilters,
  useTenantSearchLoadInitial,
  useTenantSearchLoadMore,
  useTenantSearchReset,
} from '@/entities/tenant-search';
import { SearchInput, DateFilter, useSearchFilters } from '@/features/tenant-search-filters';
import { useSelection, SelectionToolbar } from '@/features/user-selection';
import { BroadcastForm } from '@/features/broadcast-notification';
import { UserListView } from './UserListView';
import { BroadcastSidebar } from './BroadcastSidebar';

export function BroadcastPanel() {
  const isMobile = useIsMobile();
  const initData = useTelegramInitData();
  const [showFormSheet, setShowFormSheet] = useState(false);

  // Tenant search store
  const users = useTenantSearchUsers();
  const meta = useTenantSearchMeta();
  const isLoading = useTenantSearchLoading();
  const isLoadingMore = useTenantSearchLoadingMore();
  const hasMore = useTenantSearchHasMore();
  const error = useTenantSearchError();
  const filters = useTenantSearchFilters();
  const loadInitial = useTenantSearchLoadInitial();
  const loadMore = useTenantSearchLoadMore();
  const resetSearch = useTenantSearchReset();

  // Filters
  const { setSearch, setRegisteredFrom, clearFilters, hasActiveFilters } = useSearchFilters();

  // Selection
  const selection = useSelection({
    initData,
    currentFilters: filters,
    totalCount: meta?.total || 0,
  });

  // Load initial data
  useEffect(() => {
    if (initData) {
      loadInitial(initData);
    }

    return () => {
      resetSearch();
    };
  }, [initData, loadInitial, resetSearch]);

  // Reload when filters change
  useEffect(() => {
    if (initData) {
      loadInitial(initData);
    }
  }, [filters, initData, loadInitial]);

  const handleLoadMore = () => {
    if (initData && !isLoadingMore && hasMore) {
      loadMore(initData);
    }
  };

  const handleSuccess = () => {
    selection.clearSelection();
    if (isMobile) {
      setShowFormSheet(false);
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Рассылка уведомлений</h1>
            <p className="text-muted-foreground mt-1">
              Выберите пользователей и отправьте уведомление
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <SearchInput
              value={filters.search || ''}
              onChange={setSearch}
            />
            <DateFilter
              value={filters.registeredFrom || ''}
              onChange={setRegisteredFrom}
            />
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Сбросить фильтры
              </Button>
            )}
          </div>

          {/* Selection Toolbar */}
          <SelectionToolbar
            selectionMode={selection.selectionMode}
            selectedCount={selection.getSelectedCount()}
            onSelectAll={selection.selectAll}
            onClearSelection={selection.clearSelection}
            disabled={isLoading}
          />

          {/* User List */}
          <UserListView
            users={users}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={handleLoadMore}
            isSelected={selection.isSelected}
            onToggleUser={selection.toggleUser}
          />
        </div>

        {/* FAB for opening form */}
        {!showFormSheet && selection.getSelectedCount() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 w-14 p-0"
              onClick={() => setShowFormSheet(true)}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Form Sheet */}
        <Sheet open={showFormSheet} onOpenChange={setShowFormSheet}>
          <SheetContent side="right" className="w-full p-4 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Создать рассылку</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <BroadcastForm
                selectedCount={selection.getSelectedCount()}
                getTenantIds={selection.getTenantIdsForSending}
                initData={initData}
                onSuccess={handleSuccess}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Рассылка уведомлений</h1>
        <p className="text-muted-foreground mt-1">
          Выберите пользователей и отправьте уведомление
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left panel: Filters + User List (60%) */}
        <div className="flex-1 space-y-4">
          {/* Filters */}
          <div className="space-y-3 p-4 bg-card rounded-lg border">
            <SearchInput
              value={filters.search || ''}
              onChange={setSearch}
            />
            <DateFilter
              value={filters.registeredFrom || ''}
              onChange={setRegisteredFrom}
            />
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Сбросить фильтры
              </Button>
            )}
          </div>

          {/* Selection Toolbar */}
          <SelectionToolbar
            selectionMode={selection.selectionMode}
            selectedCount={selection.getSelectedCount()}
            onSelectAll={selection.selectAll}
            onClearSelection={selection.clearSelection}
            disabled={isLoading}
          />

          {/* User List */}
          <UserListView
            users={users}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={handleLoadMore}
            isSelected={selection.isSelected}
            onToggleUser={selection.toggleUser}
          />
        </div>

        {/* Right sidebar: Broadcast Form (40%) */}
        <div className="w-[40%]">
          <BroadcastSidebar
            selectedCount={selection.getSelectedCount()}
            getTenantIds={selection.getTenantIdsForSending}
            initData={initData}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
