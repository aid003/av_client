'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Clapperboard } from 'lucide-react';

// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/components/ui/tabs';
// import { VideoJsPlayer } from '@/shared/ui/components/video-player';
// import { GuideWizard } from '@/widgets/guide-wizard';

export default function Home() {
  return (
    <div className="container mx-auto px-3 md:px-6 py-6 max-w-2xl flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Clapperboard className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Видеокурс в разработке</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-muted-foreground">
            Мы готовим для вас подробный видеокурс по работе с платформой.
          </p>
          <p className="text-muted-foreground">
            Совсем скоро здесь появятся обучающие материалы, которые помогут вам быстро освоить все возможности системы.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Следите за обновлениями!
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // return (
  //   <div 
  //     className="container mx-auto px-3 md:px-6 pt-3 md:pt-6 pb-0 max-w-5xl h-[calc(var(--app-dvh,100dvh)-max(2rem,calc(env(safe-area-inset-top,0px)+0.5rem)))] md:h-[calc(var(--app-dvh,100dvh)-3rem)] min-h-0 flex flex-col overflow-hidden"
  //   >
  //     <Tabs defaultValue="video" className="w-full min-h-0 flex-1 flex flex-col" style={{ gap: 0 }}>
  //       {/* TabsList сверху на всех устройствах */}
  //       <TabsList className="grid w-full grid-cols-2 mb-3 md:mb-4 flex-shrink-0">
  //         <TabsTrigger value="video">Видео курс</TabsTrigger>
  //         <TabsTrigger value="text">Интерактивный гайд</TabsTrigger>
  //       </TabsList>

  //       {/* Video tab: на мобильной фиксированный aspect-ratio, на десктопе заполняет пространство */}
  //       <TabsContent value="video" className="m-0 md:flex-1 md:min-h-0">
  //         <div className="w-full aspect-video md:h-full md:aspect-auto rounded-lg overflow-hidden bg-muted/50 p-2 md:p-4">
  //           <VideoJsPlayer
  //             src="/video/guide.mp4"
  //             fallbackSrc="/video/guide.mov"
  //             className="w-full h-full"
  //           />
  //         </div>
  //       </TabsContent>

  //       {/* Text tab: заполняет пространство и скроллится */}
  //       <TabsContent value="text" className="flex-1 min-h-0 overflow-auto m-0">
  //         <GuideWizard />
  //       </TabsContent>
  //     </Tabs>
  //   </div>
  // );
}