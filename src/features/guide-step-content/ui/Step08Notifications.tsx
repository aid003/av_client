'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Bell, RefreshCw, ArrowRight } from 'lucide-react';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step08Notifications({ onComplete, onSkip }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Настройка уведомлений</h2>
        <p className="text-muted-foreground">
          Будьте в курсе важных событий в системе
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Типы уведомлений</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Новые сообщения</p>
            <p>• Ошибки скриптов</p>
            <p>• Системные события</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">Механизм polling</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Проверка каждые 60 секунд. Интеграция с Telegram.
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {onSkip && (
          <Button
            size="lg"
            variant="ghost"
            className="flex-1"
            onClick={onSkip}
          >
            Пропустить
          </Button>
        )}
        <Button
          size="lg"
          className="flex-1 hover:scale-105 active:scale-95 transition-transform"
          onClick={() => {
            onComplete();
          }}
        >
          Продолжить
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
