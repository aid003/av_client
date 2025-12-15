'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/components/ui/table';
import { Button } from '@/shared/ui/components/ui/button';
import { Badge } from '@/shared/ui/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Loader2, Eye, X, Trash2, CheckCircle2 } from 'lucide-react';
import type { Notification } from '@/entities/notification';

interface NotificationsTableProps {
  notifications: Notification[];
  loading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const typeColors: Record<string, string> = {
  INFO: 'bg-blue-500',
  WARNING: 'bg-yellow-500',
  ERROR: 'bg-red-500',
  SUCCESS: 'bg-green-500',
  SYSTEM: 'bg-purple-500',
};

const typeLabels: Record<string, string> = {
  INFO: 'Инфо',
  WARNING: 'Пред.',
  ERROR: 'Ошибка',
  SUCCESS: 'Успех',
  SYSTEM: 'Система',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  URGENT: 'Срочный',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-600',
};

export function NotificationsTable({
  notifications,
  loading,
  page,
  totalPages,
  onPageChange,
  onMarkAsRead,
  onDismiss,
  onDelete,
}: NotificationsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDeleteClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNotification) return;

    setActionLoading(selectedNotification.id);
    try {
      await onDelete(selectedNotification.id);
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAction = async (
    id: string,
    action: () => Promise<void>
  ) => {
    setActionLoading(id);
    try {
      await action();
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Уведомления не найдены
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Тип</TableHead>
              <TableHead className="w-[100px]">Приоритет</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead className="w-[200px]">Сообщение</TableHead>
              <TableHead className="w-[120px]">Статус</TableHead>
              <TableHead className="w-[150px]">Дата создания</TableHead>
              <TableHead className="w-[200px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => {
              const isLoading = actionLoading === notification.id;

              return (
                <TableRow key={notification.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${typeColors[notification.type]} text-white border-0`}
                    >
                      {typeLabels[notification.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${priorityColors[notification.priority]} text-white border-0`}
                    >
                      {priorityLabels[notification.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {notification.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {truncate(notification.message, 50)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {notification.isRead ? (
                        <Badge variant="secondary" className="w-fit">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Прочитано
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit">
                          Непрочитано
                        </Badge>
                      )}
                      {notification.isDismissed && (
                        <Badge variant="outline" className="w-fit text-xs">
                          Закрыто
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(notification.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAction(notification.id, () =>
                              onMarkAsRead(notification.id)
                            )
                          }
                          disabled={isLoading}
                          title="Отметить как прочитанное"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {notification.isDismissible && !notification.isDismissed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAction(notification.id, () =>
                              onDismiss(notification.id)
                            )
                          }
                          disabled={isLoading}
                          title="Закрыть"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(notification)}
                        disabled={isLoading}
                        title="Удалить"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Страница {page} из {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить уведомление?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить уведомление "{selectedNotification?.title}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedNotification(null);
              }}
              disabled={actionLoading !== null}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={actionLoading !== null}
            >
              {actionLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

