'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs';
import { VideoJsPlayer } from '@/shared/ui/components/video-player';

export default function Home() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="video">Видео курс</TabsTrigger>
          <TabsTrigger value="text">Текстовый гайд</TabsTrigger>
        </TabsList>
        
        <TabsContent value="video" className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-muted/50 p-4">
            <VideoJsPlayer
              src="/video/guide.mp4"
              fallbackSrc="/video/guide.mov"
              className="w-full"
            />
          </div>
          <p className="text-muted-foreground">
            Смотрите пошаговую инструкцию по использованию системы в видео формате.
          </p>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-8 text-center">
            <p className="text-lg text-muted-foreground">Текстовый гайд скоро появится</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}