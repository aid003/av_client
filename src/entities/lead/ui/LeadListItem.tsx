import { Card, CardContent } from '@/shared/ui/components/ui/card';
import { User, Phone, DollarSign, FileCode } from 'lucide-react';
import type { Lead } from '../model/types';
import { getSlotPhone, formatSlotCurrency } from '../lib';
import { CopyButton } from '@/shared/ui/components/copy-button';

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
              {getSlotPhone(lead.slots) && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{getSlotPhone(lead.slots)}</span>
                  <CopyButton text={getSlotPhone(lead.slots)!} size="sm" variant="ghost" />
                </div>
              )}
              {formatSlotCurrency(lead.slots, 'budget') && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>{formatSlotCurrency(lead.slots, 'budget')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground">
              {formatDate(lead.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
