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
import { CopyButton } from '@/shared/ui/components/copy-button';
import Link from 'next/link';

interface LeadCardProps {
  lead: Lead;
  showChatLink?: boolean;
}

export function LeadCard({ lead, showChatLink = false }: LeadCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">Информация о лиде</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-0">
        <div className="grid gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="font-medium shrink-0">Клиент:</span>
            <span className="break-words">{lead.clientName || '—'}</span>
          </div>

          {lead.scriptName && (
            <div className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base">
              <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="font-medium shrink-0">Скрипт:</span>
              <span className="break-words">{lead.scriptName}</span>
            </div>
          )}

          <div className="flex items-start gap-2 sm:gap-2.5 text-sm sm:text-base">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="font-medium shrink-0">Последнее сообщение:</span>
            <span className="break-words">
              {new Date(lead.lastMessageAt).toLocaleString('ru-RU', {
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
              className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Перейти к чату</span>
            </Link>
          )}
        </div>

        {lead.slots && Object.keys(lead.slots).length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
            <h4 className="font-medium mb-2 sm:mb-2.5 text-sm sm:text-base">Собранные данные:</h4>
            <div className="grid gap-2 sm:gap-2.5">
              {getSlotEntries(lead.slots).map(({ key, value }) => (
                <div key={key} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground shrink-0">{getSlotLabel(key)}:</span>
                  <span className="font-medium break-words flex-1">{formatSlotValue(value)}</span>
                  {typeof value === 'string' && (
                    <CopyButton text={value} size="sm" variant="ghost" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
