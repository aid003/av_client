'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/components/ui/dropdown-menu';
import { Button } from '@/shared/ui/components/ui/button';
import {
  FileCode,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import type { SalesScript } from '../model/types';

interface SalesScriptCardProps {
  script: SalesScript;
  onEdit?: (script: SalesScript) => void;
  onDelete?: (script: SalesScript) => void;
  onAttachAds?: (script: SalesScript) => void;
}

export function SalesScriptCard({
  script,
  onEdit,
  onDelete,
  onAttachAds,
}: SalesScriptCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md p-0 gap-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 border-b bg-muted/30">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg leading-none tracking-tight truncate">
              {script.name}
            </h3>
            <Badge variant={script.isActive ? 'default' : 'secondary'}>
              {script.isActive ? 'Активен' : 'Неактивен'}
            </Badge>
          </div>
          {script.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {script.description}
            </p>
          )}
        </div>
        <div className="-mr-1 -mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAttachAds && (
                <DropdownMenuItem onClick={() => onAttachAds(script)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Привязать объявления
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(script)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(script)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 p-4 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>Создан: {formatDate(script.createdAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/sales-scripts/${script.id}/edit`}>
              <FileCode className="h-4 w-4 mr-2" />
              Редактировать скрипт
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
