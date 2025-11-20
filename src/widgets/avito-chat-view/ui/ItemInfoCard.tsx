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
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Изображение товара */}
          <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="96px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <h3 className="font-semibold text-base line-clamp-2 mb-1">
                {title}
              </h3>
              {price_string && (
                <p className="text-xl font-bold text-primary">
                  {price_string}
                </p>
              )}
            </div>

            {location?.title && (
              <Badge variant="secondary" className="text-xs w-fit">
                <MapPin className="w-3 h-3 mr-1" />
                {location.title}
              </Badge>
            )}

            {url && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full sm:w-auto"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center"
                >
                  <ExternalLink className="h-4 w-4" />
                  Открыть на Avito
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
