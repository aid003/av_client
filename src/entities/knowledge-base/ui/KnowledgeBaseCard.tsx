'use client';

import { useState } from 'react';
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
  BookText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  Upload,
  FileText,
} from 'lucide-react';
import type { KnowledgeBase } from '../model/types';

interface KnowledgeBaseCardProps {
  knowledgeBase: KnowledgeBase;
  onEdit?: (kb: KnowledgeBase) => void;
  onDelete?: (kb: KnowledgeBase) => void;
  onUploadMaterials?: (kb: KnowledgeBase) => void;
  onViewChunks?: (kb: KnowledgeBase) => void;
  onAttachAds?: (kb: KnowledgeBase) => void;
}

export function KnowledgeBaseCard({
  knowledgeBase,
  onEdit,
  onDelete,
  onUploadMaterials,
  onViewChunks,
  onAttachAds,
}: KnowledgeBaseCardProps) {
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

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      semantic: 'Семантический',
      sentence: 'По предложениям',
      fixed: 'Фиксированный размер',
    };
    return labels[method] || method;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md p-0 gap-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 border-b bg-muted/30">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookText className="h-4 w-4 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg leading-none tracking-tight truncate">
              {knowledgeBase.name}
            </h3>
          </div>
          {knowledgeBase.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {knowledgeBase.description}
            </p>
          )}
        </div>
        <div className="-mr-1 -mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAttachAds && (
                <DropdownMenuItem onClick={() => onAttachAds(knowledgeBase)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Привязать объявления
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(knowledgeBase)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(knowledgeBase)}
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
          <span>Создана: {formatDate(knowledgeBase.createdAt)}</span>
        </div>

        {knowledgeBase.chunkingConfig && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings className="h-3.5 w-3.5 shrink-0" />
              <span>Настройки чанкинга</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-normal border">
                {getMethodLabel(knowledgeBase.chunkingConfig.method)}
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-normal">
                {knowledgeBase.chunkingConfig.minChunkSize}-{knowledgeBase.chunkingConfig.maxChunkSize} симв.
              </Badge>
              {knowledgeBase.chunkingConfig.splitOnSentences && (
                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-normal">
                  По предложениям
                </Badge>
              )}
              {knowledgeBase.chunkingConfig.splitOnParagraphs && (
                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-normal">
                  По абзацам
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {(onUploadMaterials || onViewChunks) && (
        <CardFooter className="p-4 pt-0">
          <div className="w-full pt-4 border-t">
            <div className="flex flex-col gap-2">
              {onUploadMaterials && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onUploadMaterials(knowledgeBase)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Загрузить материалы
                </Button>
              )}
              {onViewChunks && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onViewChunks(knowledgeBase)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Управление чанками
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
