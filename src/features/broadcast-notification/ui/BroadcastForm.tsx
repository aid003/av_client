'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/shared/ui/components/ui/button';
import { Input } from '@/shared/ui/components/ui/input';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Label } from '@/shared/ui/components/ui/label';
import { Switch } from '@/shared/ui/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/ui/dialog';
import { Loader2, Send } from 'lucide-react';
import { useBroadcast } from '../lib/use-broadcast';
import { BroadcastProgress as BroadcastProgressComponent } from './BroadcastProgress';
import type { CreateNotificationDto, NotificationType, NotificationPriority } from '@/entities/notification';

interface BroadcastFormProps {
  selectedCount: number;
  getTenantIds: () => Promise<string[]>;
  initData: string | null;
  onSuccess?: () => void;
}

export function BroadcastForm({
  selectedCount,
  getTenantIds,
  initData,
  onSuccess,
}: BroadcastFormProps) {
  const [formData, setFormData] = useState<CreateNotificationDto>({
    type: 'INFO',
    priority: 'MEDIUM',
    title: '',
    message: '',
    isDismissible: true,
    actionUrl: '',
    actionLabel: '',
    expiresAt: null,
    metadata: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { isSending, progress, errors, sendBroadcast, reset } = useBroadcast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Заголовок обязателен');
      return;
    }

    if (!formData.message.trim()) {
      setError('Сообщение обязательно');
      return;
    }

    if (formData.actionUrl && !formData.actionLabel) {
      setError('Текст кнопки действия обязателен, если указан URL действия');
      return;
    }

    if (selectedCount === 0) {
      setError('Выберите хотя бы одного пользователя');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false);
    setError(null);
    reset();

    try {
      // Check initData
      if (!initData) {
        setError('Отсутствуют данные авторизации');
        return;
      }

      // Get tenant IDs (may fetch all pages if "all" mode)
      const tenantIds = await getTenantIds();

      if (tenantIds.length === 0) {
        setError('Не найдено пользователей для рассылки');
        return;
      }

      // Prepare notification data
      const notificationData: CreateNotificationDto = {
        ...formData,
        actionUrl: formData.actionUrl || undefined,
        actionLabel: formData.actionLabel || undefined,
        expiresAt: formData.expiresAt || null,
      };

      // Send broadcast
      const result = await sendBroadcast(tenantIds, notificationData, initData);

      // Show results
      const successCount = result.success.length;
      const failedCount = result.failed.length;

      if (failedCount === 0) {
        // Full success - reset form
        setFormData({
          type: 'INFO',
          priority: 'MEDIUM',
          title: '',
          message: '',
          isDismissible: true,
          actionUrl: '',
          actionLabel: '',
          expiresAt: null,
          metadata: undefined,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else if (successCount > 0) {
        // Partial success
        setError(
          `Отправлено ${successCount} из ${tenantIds.length}. Не удалось отправить ${failedCount} уведомлений.`
        );
      } else {
        // Full failure
        setError('Не удалось отправить ни одно уведомление');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка при рассылке';
      setError(errorMessage);
    }
  };

  const isFormDisabled = isSending || selectedCount === 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Тип <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as NotificationType })
              }
              disabled={isFormDisabled}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INFO">Информация</SelectItem>
                <SelectItem value="WARNING">Предупреждение</SelectItem>
                <SelectItem value="ERROR">Ошибка</SelectItem>
                <SelectItem value="SUCCESS">Успех</SelectItem>
                <SelectItem value="SYSTEM">Система</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Приоритет</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  priority: value as NotificationPriority,
                })
              }
              disabled={isFormDisabled}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Низкий</SelectItem>
                <SelectItem value="MEDIUM">Средний</SelectItem>
                <SelectItem value="HIGH">Высокий</SelectItem>
                <SelectItem value="URGENT">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Заголовок <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Введите заголовок уведомления"
            required
            disabled={isFormDisabled}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">
            Сообщение <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Введите текст уведомления"
            rows={4}
            required
            disabled={isFormDisabled}
          />
        </div>

        {/* isDismissible */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isDismissible"
            checked={formData.isDismissible}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isDismissible: checked })
            }
            disabled={isFormDisabled}
          />
          <Label htmlFor="isDismissible" className="font-normal cursor-pointer">
            Можно закрыть уведомление
          </Label>
        </div>

        {/* Action URL */}
        <div className="space-y-2">
          <Label htmlFor="actionUrl">URL действия</Label>
          <Input
            id="actionUrl"
            value={formData.actionUrl}
            onChange={(e) =>
              setFormData({ ...formData, actionUrl: e.target.value })
            }
            placeholder="/settings/tokens"
            disabled={isFormDisabled}
          />
        </div>

        {/* Action Label */}
        {formData.actionUrl && (
          <div className="space-y-2">
            <Label htmlFor="actionLabel">
              Текст кнопки действия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="actionLabel"
              value={formData.actionLabel}
              onChange={(e) =>
                setFormData({ ...formData, actionLabel: e.target.value })
              }
              placeholder="Обновить токен"
              required
              disabled={isFormDisabled}
            />
          </div>
        )}

        {/* Expires At */}
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Дата истечения</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={
              formData.expiresAt
                ? new Date(formData.expiresAt).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                expiresAt: e.target.value || null,
              })
            }
            disabled={isFormDisabled}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isFormDisabled}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Отправить рассылку ({selectedCount})
            </>
          )}
        </Button>
      </form>

      {/* Progress */}
      {(isSending || progress.total > 0) && (
        <BroadcastProgressComponent
          progress={progress}
          errors={errors}
          isComplete={!isSending && progress.total > 0}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение рассылки</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите отправить уведомление <strong>{selectedCount}</strong>{' '}
              пользовател{selectedCount === 1 ? 'ю' : 'ям'}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleConfirmSend}>
              <Send className="h-4 w-4 mr-2" />
              Отправить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
