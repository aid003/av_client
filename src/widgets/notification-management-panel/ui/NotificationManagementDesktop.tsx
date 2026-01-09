'use client';

import { useState } from 'react';
import { useAdminNotifications, useNotificationSelection } from '@/features/admin-notifications';
import { NotificationsTable } from '@/features/admin-notifications/ui/NotificationsTable';
import { BulkActionToolbar } from '@/features/admin-notifications/ui/BulkActionToolbar';
import { BulkDeleteDialog } from '@/features/admin-notifications/ui/BulkDeleteDialog';
import { BulkDismissDialog } from '@/features/admin-notifications/ui/BulkDismissDialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Label } from '@/shared/ui/components/ui/label';
import { X } from 'lucide-react';
import type { NotificationType } from '@/entities/notification';

interface NotificationManagementDesktopProps {
  tenantId: string;
}

export function NotificationManagementDesktop({ tenantId }: NotificationManagementDesktopProps) {
  const adminNotifications = useAdminNotifications({ tenantId });
  const selection = useNotificationSelection({
    notifications: adminNotifications.notifications,
  });

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDismissDialogOpen, setBulkDismissDialogOpen] = useState(false);

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDismissClick = () => {
    setBulkDismissDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selection.selectedIds);
    const results = await adminNotifications.handleBulkDelete(ids);

    if (results.failed.length > 0) {
      console.error('Failed to delete some notifications:', results.failed);
    }

    selection.clearSelection();
  };

  const handleBulkDismissConfirm = async () => {
    const ids = Array.from(selection.selectedIds);
    const results = await adminNotifications.handleBulkDismiss(ids);

    if (results.failed.length > 0) {
      console.error('Failed to dismiss some notifications:', results.failed);
    }

    selection.clearSelection();
  };

  const hasActiveFilters =
    !!adminNotifications.filters.type ||
    !!adminNotifications.filters.search ||
    adminNotifications.filters.unreadOnly ||
    adminNotifications.filters.activeOnly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Управление уведомлениями</h1>
        <p className="text-muted-foreground mt-1">
          Просмотр и управление всеми уведомлениями
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-card rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="search">Поиск</Label>
            <Input
              id="search"
              placeholder="Поиск по заголовку или сообщению..."
              value={adminNotifications.filters.search || ''}
              onChange={(e) =>
                adminNotifications.updateFilters({ search: e.target.value })
              }
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type">Тип</Label>
            <Select
              value={adminNotifications.filters.type || 'all'}
              onValueChange={(value) =>
                adminNotifications.updateFilters({
                  type: value === 'all' ? undefined : (value as NotificationType),
                })
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="INFO">Инфо</SelectItem>
                <SelectItem value="WARNING">Предупреждение</SelectItem>
                <SelectItem value="ERROR">Ошибка</SelectItem>
                <SelectItem value="SUCCESS">Успех</SelectItem>
                <SelectItem value="SYSTEM">Система</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Unread Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unreadOnly"
              checked={adminNotifications.filters.unreadOnly || false}
              onCheckedChange={(checked) =>
                adminNotifications.updateFilters({ unreadOnly: !!checked })
              }
            />
            <Label htmlFor="unreadOnly" className="text-sm font-normal cursor-pointer">
              Только непрочитанные
            </Label>
          </div>

          {/* Active Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="activeOnly"
              checked={adminNotifications.filters.activeOnly || false}
              onCheckedChange={(checked) =>
                adminNotifications.updateFilters({ activeOnly: !!checked })
              }
            />
            <Label htmlFor="activeOnly" className="text-sm font-normal cursor-pointer">
              Только активные
            </Label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={adminNotifications.resetFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selection.selectedCount}
        onBulkDelete={handleBulkDeleteClick}
        onBulkDismiss={handleBulkDismissClick}
        onClearSelection={selection.clearSelection}
        disabled={adminNotifications.loading}
      />

      {/* Table */}
      <NotificationsTable
        notifications={adminNotifications.notifications}
        loading={adminNotifications.loading}
        page={adminNotifications.page}
        totalPages={adminNotifications.totalPages}
        onPageChange={adminNotifications.goToPage}
        onMarkAsRead={adminNotifications.handleMarkAsRead}
        onDismiss={adminNotifications.handleDismiss}
        onDelete={adminNotifications.handleDelete}
        selectable
        selectedIds={selection.selectedIds}
        onToggleSelection={selection.toggleSelection}
        onSelectAll={selection.selectAll}
        isAllSelected={selection.isAllSelected}
        isSomeSelected={selection.isSomeSelected}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedCount={selection.selectedCount}
        notifications={selection.getSelectedNotifications()}
        onConfirm={handleBulkDeleteConfirm}
      />

      {/* Bulk Dismiss Dialog */}
      <BulkDismissDialog
        open={bulkDismissDialogOpen}
        onOpenChange={setBulkDismissDialogOpen}
        selectedCount={selection.selectedCount}
        notifications={selection.getSelectedNotifications()}
        onConfirm={handleBulkDismissConfirm}
      />
    </div>
  );
}
