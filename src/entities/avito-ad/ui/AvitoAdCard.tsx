import { ExternalLink, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Button } from '@/shared/ui/components/ui/button';
import type { AvitoAd } from '../model/types';

interface AvitoAdCardProps {
  ad: AvitoAd;
}

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

  return (
    <Card className="relative flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="text-base sm:text-lg font-semibold line-clamp-2 break-words"
              title={ad.title}
            >
              {ad.title}
            </h3>
            <p className="text-lg sm:text-xl font-bold text-primary mt-1">
              {formatPrice(ad.price)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0"
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
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2 break-words" title={ad.address}>
              {ad.address}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs font-normal">
              {ad.category.name}
            </Badge>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground break-all">
            ID: {ad.itemId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
