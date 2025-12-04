import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/ui/components/ui/card';
import {
  User,
  FileCode,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type { Lead } from '../model/types';
import { getSlotEntries, formatSlotValue, getSlotLabel } from '../lib';
import Link from 'next/link';

interface LeadCardProps {
  lead: Lead;
  showChatLink?: boolean;
}

export function LeadCard({ lead, showChatLink = false }: LeadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Информация о лиде</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Клиент:</span>
            <span>{lead.clientName || '—'}</span>
          </div>

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

        {lead.slots && Object.keys(lead.slots).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Собранные данные:</h4>
            <div className="grid gap-2">
              {getSlotEntries(lead.slots).map(({ key, value }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{getSlotLabel(key)}:</span>
                  <span className="font-medium">{formatSlotValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
