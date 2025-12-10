import { Badge } from '@/shared/ui/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export function NotificationBadge({
  count,
  className,
  max = 99,
}: NotificationBadgeProps) {
  if (count === 0) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="destructive"
      className={cn(
        'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}
