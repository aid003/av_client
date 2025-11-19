import { ExternalLink, MapPin, Tag, Hash, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Button } from '@/shared/ui/components/ui/button';
import type { AvitoAd } from '../model/types';

interface AvitoAdCardProps {
  ad: AvitoAd;
}

const statusConfig: Record<AvitoAd['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Активно', variant: 'default' },
  REMOVED: { label: 'Удалено', variant: 'secondary' },
  OLD: { label: 'Завершено', variant: 'secondary' },
  BLOCKED: { label: 'Заблокировано', variant: 'destructive' },
  REJECTED: { label: 'Отклонено', variant: 'destructive' },
  NOT_FOUND: { label: 'Не найдено', variant: 'outline' },
  ANOTHER_USER: { label: 'Другой пользователь', variant: 'outline' },
};

export function AvitoAdCard({ ad }: AvitoAdCardProps) {
  const formatPrice = (price: string) => {
    const num = parseInt(price, 10);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const status = statusConfig[ad.status];

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md p-0 gap-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 border-b bg-muted/30">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-2">
          <h3
            className="font-semibold text-base leading-snug tracking-tight max-h-[2.75rem] overflow-hidden wrap-break-word"
            title={ad.title}
          >
            {ad.title}
          </h3>
          <p className="text-xl font-bold text-primary">
            {formatPrice(ad.price)}
          </p>
        </div>
        <div className="flex items-center gap-2 -mr-1 -mt-1 shrink-0">
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <a
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Открыть на Avito"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 p-4 pt-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2" title={ad.address}>
            {ad.address}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            <span>Категория</span>
          </div>
          <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-normal border">
            {ad.category.name}
          </Badge>
        </div>

        {(ad.startTime || ad.finishTime) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Период размещения</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {ad.startTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(ad.startTime)}</span>
                </div>
              )}
              {ad.startTime && ad.finishTime && <span>—</span>}
              {ad.finishTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(ad.finishTime)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full pt-4 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          <span className="font-mono">{ad.itemId}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
