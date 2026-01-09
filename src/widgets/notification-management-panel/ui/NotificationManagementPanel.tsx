'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { useTelegramInitData } from '@/shared/lib/use-telegram-init-data';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import {
  useTenantSearchStore,
  useTenantSearchUsers,
  useTenantSearchLoading,
  useTenantSearchLoadInitial,
  useTenantSearchUpdateFilters,
} from '@/entities/tenant-search/model/store';
import { UserListView, UserSelectionMobile } from '@/features/user-selection';
import { NotificationManagementDesktop } from './NotificationManagementDesktop';
import { MobileHeader } from './MobileHeader';
import { Loader2 } from 'lucide-react';

type MobileView = 'users' | 'notifications';

export function NotificationManagementPanel() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();
  const initData = useTelegramInitData();
  const isMobile = useIsMobile();

  // Tenant selection state
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('users');

  // Tenant search
  const tenants = useTenantSearchUsers();
  const loading = useTenantSearchLoading();
  const loadInitial = useTenantSearchLoadInitial();
  const updateFilters = useTenantSearchUpdateFilters();

  // Handle search with filter update
  const handleSearch = useCallback(
    (query: string) => {
      updateFilters({ search: query });
      if (initData) {
        loadInitial(initData);
      }
    },
    [updateFilters, loadInitial, initData]
  );

  // Handle tenant selection
  const handleSelectTenant = useCallback(
    (tenantId: string) => {
      setSelectedTenantId(tenantId);
      if (isMobile) {
        setMobileView('notifications');
      }
    },
    [isMobile]
  );

  // Handle back to user list (mobile)
  const handleBackToUsers = useCallback(() => {
    setMobileView('users');
    setSelectedTenantId(null);
  }, []);

  // Get selected tenant name for mobile header
  const selectedTenant = useMemo(
    () => tenants.find((t) => t.tenantId === selectedTenantId),
    [tenants, selectedTenantId]
  );

  const selectedTenantName = useMemo(() => {
    if (!selectedTenant) return '';
    const { telegramUser } = selectedTenant;
    return [telegramUser.firstName, telegramUser.lastName].filter(Boolean).join(' ') || 'Пользователь';
  }, [selectedTenant]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Auth check
  if (!isAuthenticated || !authData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Необходима авторизация</p>
      </div>
    );
  }

  // Mobile version
  if (isMobile) {
    if (mobileView === 'users' || !selectedTenantId) {
      return (
        <UserSelectionMobile
          tenants={tenants}
          loading={loading}
          onSearch={handleSearch}
          onSelect={handleSelectTenant}
          selectedTenantId={selectedTenantId}
        />
      );
    } else {
      return (
        <div>
          <MobileHeader onBack={handleBackToUsers} tenantName={selectedTenantName} />
          <NotificationManagementDesktop tenantId={selectedTenantId} />
        </div>
      );
    }
  }

  // Desktop version
  return (
    <div className="flex gap-6">
      {/* Left: User List */}
      <div className="w-80 shrink-0">
        <UserListView
          tenants={tenants}
          loading={loading}
          onSearch={handleSearch}
          selectedTenantId={selectedTenantId}
          onSelectTenant={handleSelectTenant}
        />
      </div>

      {/* Right: Notifications */}
      <div className="flex-1 min-w-0">
        {selectedTenantId ? (
          <NotificationManagementDesktop tenantId={selectedTenantId} />
        ) : (
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <p className="text-muted-foreground mb-2">Выберите пользователя</p>
              <p className="text-sm text-muted-foreground">
                для управления уведомлениями
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
