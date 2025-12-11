import { Badge } from '@/shared/ui/components/ui/badge';
import type { AvitoAd } from '../../../model/types';

const statusConfig: Record<
  AvitoAd['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  ACTIVE: { label: 'Активно', variant: 'default' },
  REMOVED: { label: 'Удалено', variant: 'secondary' },
  OLD: { label: 'Завершено', variant: 'secondary' },
  BLOCKED: { label: 'Заблокировано', variant: 'destructive' },
  REJECTED: { label: 'Отклонено', variant: 'destructive' },
  NOT_FOUND: { label: 'Не найдено', variant: 'outline' },
  ANOTHER_USER: { label: 'Другой пользователь', variant: 'outline' },
};

export function StatusCell({ status }: { status: AvitoAd['status'] }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
