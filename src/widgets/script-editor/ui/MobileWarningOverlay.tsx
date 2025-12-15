'use client';

import { Smartphone, Monitor, RotateCw } from 'lucide-react';
import { useScreenSize } from '@/shared/hooks';

export function MobileWarningOverlay() {
  const { isSmallScreen, isPortrait } = useScreenSize();

  if (!isSmallScreen || !isPortrait) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-6">
          <Smartphone className="w-16 h-16 text-muted-foreground" />
          <RotateCw className="w-12 h-12 text-muted-foreground animate-pulse" />
          <Monitor className="w-16 h-16 text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Редактор не предназначен для маленьких экранов
          </h2>

          <div className="space-y-4 text-muted-foreground">
            <p className="text-lg">
              Для комфортной работы с редактором скриптов, пожалуйста:
            </p>

            <ul className="space-y-2 text-left">
              <li className="flex items-start gap-2">
                <RotateCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Поверните устройство в горизонтальное положение</span>
              </li>
              <li className="flex items-start gap-2">
                <Monitor className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Или откройте на компьютере/планшете</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mt-6 pt-6 border-t">
          Редактор требует достаточного пространства для работы с блоками и связями между ними
        </div>
      </div>
    </div>
  );
}
