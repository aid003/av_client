'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ExternalLink, ImageIcon, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Button } from '@/shared/ui/components/ui/button';
import { Badge } from '@/shared/ui/components/ui/badge';

interface ItemInfoCardProps {
  title: string;
  price_string?: string;
  images?: {
    main: Record<string, string>;
    count: number;
  };
  location?: {
    lat: number;
    lon: number;
    title: string;
  };
  url?: string;
}

export function ItemInfoCard({
  title,
  price_string,
  images,
  location,
  url,
}: ItemInfoCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = images?.main ? Object.values(images.main)[0] : null;

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-1.5">
        <div className="flex gap-1.5">
          {/* Изображение товара */}
          <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden bg-muted">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs line-clamp-1 leading-tight break-words">
                {title}
              </h3>
              {price_string && (
                <p className="font-bold text-xs text-primary leading-tight">
                  {price_string}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {location?.title && (
                <Badge variant="secondary" className="text-xs w-fit h-5 px-1.5 max-w-[120px]">
                  <MapPin className="w-2.5 h-2.5 mr-1 shrink-0" />
                  <span className="truncate">{location.title}</span>
                </Badge>
              )}

              {url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-6 text-xs px-2"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">Открыть на Avito</span>
                    <span className="sm:hidden">Avito</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
