import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui/components/ui/card';
import { Badge } from '@/shared/ui/components/ui/badge';
import {
  User,
  Phone,
  DollarSign,
  FileCode,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type { Lead } from '../model/types';
import Link from 'next/link';

interface LeadCardProps {
  lead: Lead;
  showChatLink?: boolean;
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

export function LeadCard({ lead, showChatLink = false }: LeadCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Информация о лиде</CardTitle>
          <Badge className={`${getStatusColor(lead.status)}`}>
            {getStatusLabel(lead.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Клиент:</span>
            <span>{lead.clientName || '—'}</span>
          </div>

          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Телефон:</span>
              <span>{lead.phone}</span>
            </div>
          )}

          {lead.budget && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Бюджет:</span>
              <span>{lead.budget.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}

          {lead.scriptName && (
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Скрипт:</span>
              <span>{lead.scriptName}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Обновлен:</span>
            <span>
              {new Date(lead.updatedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {showChatLink && lead.avitoChatId && (
            <Link
              href={`/chats?chatId=${lead.avitoChatId}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Перейти к чату</span>
            </Link>
          )}
        </div>

        {lead.slots && lead.slots.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Собранные данные:</h4>
            <div className="grid gap-2">
              {lead.slots.map((slot, index) => (
                <div key={`${slot.slot}-${index}`} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{slot.slot}:</span>
                  <span className="font-medium">{String(slot.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
