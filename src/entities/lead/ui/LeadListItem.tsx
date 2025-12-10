import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { User, FileCode } from 'lucide-react';
import type { Lead } from '../model/types';

interface LeadListItemProps {
  lead: Lead;
  onClick?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Validate date
  if (isNaN(date.getTime())) {
    return '—';
  }

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

export function LeadListItem({ lead, onClick }: LeadListItemProps) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              <h3 className="font-semibold text-xs sm:text-sm truncate">
                {lead.clientName || 'Без имени'}
              </h3>
            </div>

            {lead.scriptName && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
                <FileCode className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">{lead.scriptName}</span>
              </div>
            )}

            {/* Slots data removed from list item preview */}
          </div>

          <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
            <span className="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
              {formatDate(lead.lastMessageAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
