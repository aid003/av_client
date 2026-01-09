import { useUserSettingsStore } from '@/entities/user-settings';
import { Label } from '@/shared/ui/components/ui/label';
import { Switch } from '@/shared/ui/components/ui/switch';

interface NotificationsSettingsProps {
  tenantId: string;
}

export function NotificationsSettings({ tenantId }: NotificationsSettingsProps) {
  const notificationsEnabled = useUserSettingsStore(
    (state) => state.settingsByTenant[tenantId]?.notificationsEnabled ?? true
  );
  const isLoading = useUserSettingsStore(
    (state) => state.loadingByTenant[tenantId] ?? false
  );
  const updateNotificationsEnabled = useUserSettingsStore(
    (state) => state.updateNotificationsEnabled
  );

  const handleToggle = async (checked: boolean) => {
    try {
      await updateNotificationsEnabled(tenantId, checked);
    } catch (err) {
      // Error handling is done in the store
      console.error('Failed to update notifications setting:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Уведомления</h3>
        <p className="text-sm text-muted-foreground">
          Настройте способы получения уведомлений
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5 flex-1 pr-4">
          <Label htmlFor="telegram-notifications">Дублировать в Telegram</Label>
          <p className="text-sm text-muted-foreground">
            Отправлять копии уведомлений в личные сообщения Telegram
          </p>
        </div>
        <Switch
          id="telegram-notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
