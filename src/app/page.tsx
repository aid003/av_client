'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs';
import { VideoJsPlayer } from '@/shared/ui/components/video-player';
import { GuideWizard } from '@/widgets/guide-wizard';

export default function Home() {
  return (
    <div 
      // Важно: не даём нижний padding контейнеру страницы,
      // иначе sticky footer у гайда визуально всегда будет "с отступом от низа".
      className="container mx-auto px-3 md:px-6 pt-3 md:pt-6 pb-0 max-w-5xl"
      style={{ 
        // -3rem: как на других страницах, учитываем верхнюю панель с SidebarTrigger
        height: 'calc(var(--app-dvh, 100dvh) - 3rem)',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs defaultValue="video" className="w-full flex flex-col min-h-0 flex-1">
        <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
          <TabsTrigger value="video">Видео курс</TabsTrigger>
          <TabsTrigger value="text">Интерактивный гайд</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden bg-muted/50 p-4">
            <VideoJsPlayer
              src="/video/guide.mp4"
              fallbackSrc="/video/guide.mov"
              className="w-full h-full flex-1 min-h-0"
            />
          </div>
          <p className="text-muted-foreground text-sm mt-2 flex-shrink-0">
            Смотрите пошаговую инструкцию по использованию системы в видео формате.
          </p>
        </TabsContent>

        <TabsContent value="text" className="flex-1 min-h-0 overflow-auto">
          <GuideWizard />
        </TabsContent>
      </Tabs>
    </div>
  );
}