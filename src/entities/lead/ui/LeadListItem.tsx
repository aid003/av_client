import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { User, Phone, DollarSign, FileCode } from 'lucide-react';
import type { Lead } from '../model/types';

interface LeadListItemProps {
  lead: Lead;
  onClick?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    IN_PROGRESS:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    COMPLETED:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    LOST: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Новый',
    IN_PROGRESS: 'В работе',
    COMPLETED: 'Завершен',
    LOST: 'Потерян',
  };
  return labels[status] || status;
}

export function LeadListItem({ lead, onClick }: LeadListItemProps) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-sm truncate">
                {lead.clientName || 'Без имени'}
              </h3>
            </div>

            {lead.scriptName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{lead.scriptName}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs">
              {lead.phone && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.budget && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>{lead.budget.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge
              className={`text-[10px] px-2 py-0.5 ${getStatusColor(lead.status)}`}
            >
              {getStatusLabel(lead.status)}
            </Badge>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(lead.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
