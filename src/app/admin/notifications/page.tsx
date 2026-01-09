'use client';

import { useTelegramAuth } from '@/shared/lib/use-telegram-auth';
import { BroadcastPanel } from '@/widgets/broadcast-panel';
import { NotificationManagementPanel } from '@/widgets/notification-management-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { authData, isLoading, isAuthenticated } = useTelegramAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !authData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-destructive">Необходима авторизация</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
      <Tabs defaultValue="broadcast" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="broadcast">Рассылка</TabsTrigger>
          <TabsTrigger value="manage">Управление</TabsTrigger>
        </TabsList>
        <TabsContent value="broadcast" className="mt-6">
          <BroadcastPanel />
        </TabsContent>
        <TabsContent value="manage" className="mt-6">
          <NotificationManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
