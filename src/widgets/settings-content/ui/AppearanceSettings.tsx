import { useUserSettingsStore } from '@/entities/user-settings';
import { Label } from '@/shared/ui/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select';

interface AppearanceSettingsProps {
  tenantId: string;
}

export function AppearanceSettings({ tenantId }: AppearanceSettingsProps) {
  const theme = useUserSettingsStore(
    (state) => state.settingsByTenant[tenantId]?.theme ?? 'auto'
  );
  const setTheme = useUserSettingsStore((state) => state.setTheme);

  const handleThemeChange = (value: string) => {
    if (value === 'auto' || value === 'light' || value === 'dark') {
      setTheme(tenantId, value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Тема оформления</h3>
        <p className="text-sm text-muted-foreground">
          Выберите тему оформления приложения
        </p>
      </div>
      <div className="space-y-4">
        <Label htmlFor="theme-select">Тема</Label>
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Авто (Telegram)</SelectItem>
            <SelectItem value="light">Светлая</SelectItem>
            <SelectItem value="dark">Темная</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          В режиме &quot;Авто&quot; тема автоматически синхронизируется с темой Telegram
        </p>
      </div>
    </div>
  );
}
