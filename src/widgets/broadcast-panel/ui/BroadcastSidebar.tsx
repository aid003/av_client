'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { BroadcastForm } from '@/features/broadcast-notification';

interface BroadcastSidebarProps {
  selectedCount: number;
  getTenantIds: () => Promise<string[]>;
  initData: string;
  onSuccess?: () => void;
}

export function BroadcastSidebar({
  selectedCount,
  getTenantIds,
  initData,
  onSuccess,
}: BroadcastSidebarProps) {
  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle>Создать рассылку</CardTitle>
        <CardDescription>
          Заполните форму для отправки уведомления выбранным пользователям
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BroadcastForm
          selectedCount={selectedCount}
          getTenantIds={getTenantIds}
          initData={initData}
          onSuccess={onSuccess}
        />
      </CardContent>
    </Card>
  );
}
