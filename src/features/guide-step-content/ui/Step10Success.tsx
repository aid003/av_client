'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { CheckCircle2, Rocket, Play } from 'lucide-react';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step10Success({ onComplete }: StepContentProps) {
  const completedFeatures = [
    'Привязан аккаунт Avito',
    'Создана база знаний',
    'Настроен скрипт продаж',
    'Объявления подключены к автоматизации',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-8">
      {/* Success icon with animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
        <CheckCircle2 className="w-32 h-32 text-green-500 relative animate-in zoom-in-0 duration-700" />
      </div>

      {/* Message */}
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 delay-300 duration-500">
        <h2 className="text-3xl font-bold">Поздравляем!</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Вы готовы к автоматизации продаж на Avito
        </p>
      </div>

      {/* Completion checklist */}
      <Card className="max-w-md w-full animate-in fade-in-0 slide-in-from-bottom-4 delay-500 duration-500">
        <CardHeader>
          <CardTitle>Что вы настроили:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {completedFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-left"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next steps */}
      <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in-0 slide-in-from-bottom-4 delay-700 duration-500">
        <Button
          size="lg"
          onClick={() => {
            onComplete();
            window.location.href = '/leads';
          }}
        >
          Начать работу
          <Rocket className="w-4 h-4 ml-2" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            window.location.href = '/?tab=video';
          }}
        >
          Посмотреть видео-гайд
          <Play className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground max-w-md animate-in fade-in-0 delay-1000 duration-500">
        Совет: Начните с тестирования скрипта на нескольких объявлениях,
        прежде чем применять ко всем.
      </p>
    </div>
  );
}
