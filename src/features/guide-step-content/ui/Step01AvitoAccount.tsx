'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Shield, Zap, ArrowRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step01AvitoAccount({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Привязка аккаунта Avito</h2>
        <p className="text-muted-foreground">
          Подключите свой аккаунт Avito для автоматизации работы с объявлениями и чатами
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Shield className="w-4 h-4 text-primary" />
        <AlertDescription>
          Используется стандарт OAuth 2.0 - ваш пароль никогда не передаётся приложению
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-border">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-sm">Безопасность</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            OAuth 2.0 протокол. Нет доступа к паролю.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-sm">Возможности</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            Автосинхронизация объявлений и чатов.
          </CardContent>
        </Card>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Пошаговая инструкция
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2 text-sm">
              <p>1. Нажмите кнопку "Привязать аккаунт Avito"</p>
              <p>2. Войдите в свой аккаунт Avito</p>
              <p>3. Разрешите приложению доступ к объявлениям и сообщениям</p>
              <p>4. Дождитесь подтверждения успешного подключения</p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
          window.location.href = '/avito';
        }}
      >
        Привязать аккаунт Avito
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
