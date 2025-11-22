import { Card, CardContent, CardHeader } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';

interface LoadingGridProps {
  /**
   * Количество skeleton элементов
   */
  count?: number;
  /**
   * Классы для grid контейнера
   */
  gridClassName?: string;
  /**
   * Тип skeleton для разных видов карточек
   */
  variant?: 'account' | 'ad' | 'chat' | 'default';
}

export function LoadingGrid({
  count = 3,
  gridClassName = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3',
  variant = 'default',
}: LoadingGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className={gridClassName}>
        {Array.from({ length: count }).map((_, i) => (
          <LoadingCard key={i} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function LoadingCard({ variant }: { variant: LoadingGridProps['variant'] }) {
  if (variant === 'account') {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'ad') {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'chat') {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}
