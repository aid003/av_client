import { AppearanceSettings } from './AppearanceSettings';
import { NotificationsSettings } from './NotificationsSettings';

interface SettingsContentProps {
  category: string;
  tenantId: string;
}

export function SettingsContent({ category, tenantId }: SettingsContentProps) {
  if (category === 'appearance') {
    return <AppearanceSettings tenantId={tenantId} />;
  }

  if (category === 'notifications') {
    return <NotificationsSettings tenantId={tenantId} />;
  }

  return null;
}
