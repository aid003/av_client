import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import { Button } from '@/shared/ui/components/ui/button';
import { User, DollarSign, ExternalLink } from 'lucide-react';
import type { Lead } from '@/entities/lead';
import Link from 'next/link';

interface LeadChatCardProps {
  lead: Lead;
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

export function LeadChatCard({ lead }: LeadChatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Лид</CardTitle>
          <Badge className={`text-[10px] ${getStatusColor(lead.status)}`}>
            {getStatusLabel(lead.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{lead.clientName || 'Без имени'}</span>
        </div>

        {lead.budget && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span>{lead.budget.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}

        <Link href={`/leads?leadId=${lead.id}`}>
          <Button variant="outline" size="sm" className="w-full mt-2">
            <ExternalLink className="h-3 w-3 mr-2" />
            Открыть лид
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
