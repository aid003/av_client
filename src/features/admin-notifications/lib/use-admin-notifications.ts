import { useState, useCallback, useEffect } from 'react';
import type {
  Notification,
  NotificationListParams,
  NotificationType,
  CreateNotificationDto,
} from '@/entities/notification';
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  dismissNotification,
  deleteNotification,
} from '@/entities/notification';
import { useTelegramInitData } from '@/shared/lib/use-telegram-init-data';

interface UseAdminNotificationsOptions {
  tenantId: string;
}

interface Filters {
  type?: NotificationType;
  unreadOnly?: boolean;
  activeOnly?: boolean;
  search?: string;
}

export function useAdminNotifications({ tenantId }: UseAdminNotificationsOptions) {
  const initData = useTelegramInitData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const params: NotificationListParams = {
        page,
        perPage,
        ...(filters.type && { type: filters.type }),
        ...(filters.unreadOnly && { unreadOnly: true }),
        ...(filters.activeOnly && { activeOnly: true }),
      };

      const response = await getNotifications(tenantId, params);

      // Применяем поиск на клиенте, если указан
      let filteredData = response.data;
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        filteredData = response.data.filter(
          (n) =>
            n.title.toLowerCase().includes(searchLower) ||
            n.message.toLowerCase().includes(searchLower)
        );
      }

      setNotifications(filteredData);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setUnreadCount(response.meta.unreadCount);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка при загрузке уведомлений';
      setError(errorMessage);
      console.error('[useAdminNotifications] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, page, perPage, filters]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCreate = useCallback(
    async (data: CreateNotificationDto) => {
      if (!tenantId || !initData) {
        throw new Error('Необходима авторизация');
      }

      setLoading(true);
      setError(null);

      try {
        const created = await createNotification(tenantId, data, initData);
        // Обновляем список
        await loadNotifications();
        return created;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ошибка при создании уведомления';
        setError(errorMessage);

        // Специальная обработка ошибки 403
        if (err && typeof err === 'object' && 'status' in err && err.status === 403) {
          throw new Error('Требуется роль ADMIN для создания уведомлений');
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tenantId, initData, loadNotifications]
  );

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      if (!tenantId) return;

      try {
        const updated = await markNotificationAsRead(tenantId, id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? updated : n))
        );
        // Перезагружаем для обновления счетчиков
        await loadNotifications();
      } catch (err) {
        console.error('[useAdminNotifications] Mark as read error:', err);
        throw err;
      }
    },
    [tenantId, loadNotifications]
  );

  const handleDismiss = useCallback(
    async (id: string) => {
      if (!tenantId) return;

      try {
        await dismissNotification(tenantId, id);
        // Удаляем из списка
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Перезагружаем для обновления счетчиков
        await loadNotifications();
      } catch (err) {
        console.error('[useAdminNotifications] Dismiss error:', err);
        throw err;
      }
    },
    [tenantId, loadNotifications]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!tenantId || !initData) return;

      try {
        await deleteNotification(tenantId, id, initData);
        // Удаляем из списка
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        // Перезагружаем для обновления счетчиков
        await loadNotifications();
      } catch (err) {
        console.error('[useAdminNotifications] Delete error:', err);
        throw err;
      }
    },
    [tenantId, initData, loadNotifications]
  );

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Сбрасываем на первую страницу при изменении фильтров
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleBulkDelete = useCallback(
    async (ids: string[]) => {
      if (!tenantId || !initData) return { success: [], failed: [] };

      setLoading(true);
      const results = {
        success: [] as string[],
        failed: [] as Array<{ id: string; error: string }>,
      };

      const chunks = chunk(ids, 5);

      for (const chunkIds of chunks) {
        const promises = chunkIds.map(async (id) => {
          try {
            await deleteNotification(tenantId, id, initData);
            results.success.push(id);
          } catch (err) {
            results.failed.push({
              id,
              error: err instanceof Error ? err.message : 'Неизвестная ошибка',
            });
          }
        });
        await Promise.all(promises);
      }

      await loadNotifications();
      setLoading(false);
      return results;
    },
    [tenantId, initData, loadNotifications]
  );

  const handleBulkDismiss = useCallback(
    async (ids: string[]) => {
      if (!tenantId) return { success: [], failed: [] };

      setLoading(true);
      const results = {
        success: [] as string[],
        failed: [] as Array<{ id: string; error: string }>,
      };

      const chunks = chunk(ids, 5);

      for (const chunkIds of chunks) {
        const promises = chunkIds.map(async (id) => {
          try {
            await dismissNotification(tenantId, id);
            results.success.push(id);
          } catch (err) {
            results.failed.push({
              id,
              error: err instanceof Error ? err.message : 'Неизвестная ошибка',
            });
          }
        });
        await Promise.all(promises);
      }

      await loadNotifications();
      setLoading(false);
      return results;
    },
    [tenantId, loadNotifications]
  );

  return {
    notifications,
    loading,
    error,
    filters,
    page,
    perPage,
    total,
    totalPages,
    unreadCount,
    handleCreate,
    handleMarkAsRead,
    handleDismiss,
    handleDelete,
    handleBulkDelete,
    handleBulkDismiss,
    updateFilters,
    resetFilters,
    goToPage,
    refresh: loadNotifications,
  };
}

/**
 * Utility function to split array into chunks
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

