'use client';

import type { ReactNode } from 'react';
import { TelegramProvider } from './TelegramProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProxy } from './AuthProxy';
import { ErudaDevTools } from './ErudaDevTools';
import { NotificationPollingProvider } from './NotificationPollingProvider';
import { SidebarProvider, SidebarTrigger } from '@/shared/ui/components/ui/sidebar';
import { AppSidebar } from '@/shared/ui/components/app-sidebar';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {process.env.NODE_ENV === 'development' ? <ErudaDevTools /> : null}
      <TelegramProvider>
        <ThemeProvider>
          <AuthProxy>
            <NotificationPollingProvider>
              <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 overflow-x-hidden">
                  <div className="p-2">
                    <SidebarTrigger />
                  </div>
                  {children}
                </main>
              </SidebarProvider>
            </NotificationPollingProvider>
          </AuthProxy>
        </ThemeProvider>
      </TelegramProvider>
    </>
  );
}
