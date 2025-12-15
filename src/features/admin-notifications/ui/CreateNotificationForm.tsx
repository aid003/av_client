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
  DialogTrigger,
} from '@/shared/ui/components/ui/dialog';
import { Loader2, Plus } from 'lucide-react';
import type { CreateNotificationDto, NotificationType, NotificationPriority } from '@/entities/notification';

interface CreateNotificationFormProps {
  onSubmit: (data: CreateNotificationDto) => Promise<void>;
  loading?: boolean;
}

export function CreateNotificationForm({
  onSubmit,
  loading: externalLoading,
}: CreateNotificationFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [metadataJson, setMetadataJson] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
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

    // Парсинг metadata
    let metadata: Record<string, unknown> | undefined;
    if (metadataJson.trim()) {
      try {
        metadata = JSON.parse(metadataJson);
      } catch (err) {
        setError('Неверный формат JSON в метаданных');
        return;
      }
    }

    // Парсинг expiresAt
    let expiresAt: string | null = null;
    if (formData.expiresAt) {
      const date = new Date(formData.expiresAt);
      if (isNaN(date.getTime())) {
        setError('Неверный формат даты истечения');
        return;
      }
      expiresAt = date.toISOString();
    }

    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        metadata,
        expiresAt,
        actionUrl: formData.actionUrl || undefined,
        actionLabel: formData.actionLabel || undefined,
      });

      // Сброс формы
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
      setMetadataJson('');
      setOpen(false);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка при создании уведомления';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать уведомление
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать уведомление</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового уведомления
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Тип */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Тип <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as NotificationType })
                }
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

            {/* Приоритет */}
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

          {/* Заголовок */}
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
            />
          </div>

          {/* Сообщение */}
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
            />
          </div>

          {/* Можно закрыть */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isDismissible"
              checked={formData.isDismissible}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isDismissible: checked })
              }
            />
            <Label htmlFor="isDismissible" className="font-normal cursor-pointer">
              Можно закрыть уведомление
            </Label>
          </div>

          {/* URL действия */}
          <div className="space-y-2">
            <Label htmlFor="actionUrl">URL действия</Label>
            <Input
              id="actionUrl"
              value={formData.actionUrl}
              onChange={(e) =>
                setFormData({ ...formData, actionUrl: e.target.value })
              }
              placeholder="/settings/tokens"
            />
          </div>

          {/* Текст кнопки действия */}
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
              />
            </div>
          )}

          {/* Дата истечения */}
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
            />
          </div>

          {/* Метаданные (JSON) */}
          <div className="space-y-2">
            <Label htmlFor="metadata">Метаданные (JSON)</Label>
            <Textarea
              id="metadata"
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Введите JSON объект для дополнительных метаданных
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

