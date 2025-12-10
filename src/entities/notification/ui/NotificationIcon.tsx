import { Info, AlertCircle, CheckCircle, XCircle, Bell } from 'lucide-react';
import type { NotificationType } from '../model/types';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
  size?: number;
}

export function NotificationIcon({
  type,
  className = '',
  size = 16,
}: NotificationIconProps) {
  const iconProps = {
    className,
    size,
  };

  switch (type) {
    case 'INFO':
      return <Info {...iconProps} />;
    case 'WARNING':
      return <AlertCircle {...iconProps} />;
    case 'ERROR':
      return <XCircle {...iconProps} />;
    case 'SUCCESS':
      return <CheckCircle {...iconProps} />;
    case 'SYSTEM':
      return <Bell {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
}
