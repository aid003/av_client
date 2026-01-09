'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Button } from '@/shared/ui/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Notification } from '@/entities/notification';

interface BulkDismissDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  notifications: Notification[];
  onConfirm: () => Promise<void>;
}

export function BulkDismissDialog({
  open,
  onOpenChange,
  selectedCount,
  notifications,
  onConfirm,
}: BulkDismissDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      console.error('Bulk dismiss error:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayNotifications = notifications.slice(0, 5);
  const remainingCount = notifications.length - displayNotifications.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Закрыть {selectedCount} {selectedCount === 1 ? 'уведомление' : 'уведомлений'}?
          </DialogTitle>
          <DialogDescription>
            Закрытые уведомления не будут отображаться пользователям, но останутся в системе.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-2">Выбранные уведомления:</p>
          <ul className="space-y-1">
            {displayNotifications.map((notification) => (
              <li key={notification.id} className="text-sm text-muted-foreground">
                • {notification.title}
              </li>
            ))}
            {remainingCount > 0 && (
              <li className="text-sm text-muted-foreground italic">
                ...и еще {remainingCount}
              </li>
            )}
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
