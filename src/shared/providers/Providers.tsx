'use client';

import type { ReactNode } from 'react';
import { TelegramProvider } from './TelegramProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProxy } from './AuthProxy';
import { ErudaDevTools } from './ErudaDevTools';
import { NotificationPollingProvider } from './NotificationPollingProvider';
import { ViewportUnitsProvider } from './ViewportUnitsProvider';
import { ImpersonationProvider } from './ImpersonationProvider';
import { SidebarProvider, SidebarTrigger } from '@/shared/ui/components/ui/sidebar';
import { AppSidebar } from '@/shared/ui/components/app-sidebar';
import { FloatingMenuButton } from '@/shared/ui/components/floating-menu-button';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {process.env.NODE_ENV === 'development' ? <ErudaDevTools /> : null}
      <ViewportUnitsProvider>
        <TelegramProvider>
          <ThemeProvider>
            <ImpersonationProvider>
              <AuthProxy>
                <NotificationPollingProvider>
                  <SidebarProvider>
                    <AppSidebar />
                    <FloatingMenuButton />
                    <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
                      {/* Верхняя панель с кнопкой - только на десктопе */}
                      <div className="hidden md:flex h-12 px-2 items-center shrink-0">
                        <SidebarTrigger />
                      </div>
                      {/* Контент с отступом сверху для safe-area на мобильных */}
                      <div 
                        className="md:hidden"
                        style={{
                          paddingTop: 'max(2.5rem, calc(env(safe-area-inset-top, 0px) + 5rem))'
                        }}
                      />
                      {children}
                    </main>
                  </SidebarProvider>
                </NotificationPollingProvider>
              </AuthProxy>
            </ImpersonationProvider>
          </ThemeProvider>
        </TelegramProvider>
      </ViewportUnitsProvider>
    </>
  );
}
