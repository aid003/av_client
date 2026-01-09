'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/components/ui/button';

interface MobileHeaderProps {
  tenantName: string;
  onBack: () => void;
}

export function MobileHeader({ tenantName, onBack }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h2 className="font-semibold">{tenantName}</h2>
        <p className="text-xs text-muted-foreground">Управление уведомлениями</p>
      </div>
    </div>
  );
}
