import { useState, useCallback, useMemo } from 'react';
import type { Notification } from '@/entities/notification';

interface UseNotificationSelectionOptions {
  notifications: Notification[];
}

interface UseNotificationSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  getSelectedNotifications: () => Notification[];
}

export function useNotificationSelection({
  notifications,
}: UseNotificationSelectionOptions): UseNotificationSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const isAllSelected = useMemo(() => {
    if (notifications.length === 0) return false;
    return notifications.every((n) => selectedIds.has(n.id));
  }, [notifications, selectedIds]);

  const isSomeSelected = useMemo(() => {
    if (selectedCount === 0) return false;
    return !isAllSelected;
  }, [selectedCount, isAllSelected]);

  const getSelectedNotifications = useCallback(() => {
    return notifications.filter((n) => selectedIds.has(n.id));
  }, [notifications, selectedIds]);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    getSelectedNotifications,
  };
}
