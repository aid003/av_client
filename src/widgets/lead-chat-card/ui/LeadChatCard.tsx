import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Button } from '@/shared/ui/components/ui/button';
import { User, DollarSign, ExternalLink } from 'lucide-react';
import type { Lead } from '@/entities/lead';
import { formatSlotCurrency } from '@/entities/lead';
import Link from 'next/link';

interface LeadChatCardProps {
  lead: Lead;
}

export function LeadChatCard({ lead }: LeadChatCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Лид</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{lead.clientName || 'Без имени'}</span>
        </div>

        {formatSlotCurrency(lead.slots, 'budget') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span>{formatSlotCurrency(lead.slots, 'budget')}</span>
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
