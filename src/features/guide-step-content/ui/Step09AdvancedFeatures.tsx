'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Webhook, Search, RefreshCcw, Columns, ArrowRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

const ADVANCED_FEATURES = [
  {
    icon: Webhook,
    title: 'Webhook subscriptions',
    description: 'Подписки на события Avito для мгновенных уведомлений',
  },
  {
    icon: Search,
    title: 'Тестирование поиска в БЗ',
    description: 'Проверка релевантности результатов векторного поиска',
  },
  {
    icon: RefreshCcw,
    title: 'Синхронизация объявлений',
    description: 'Обновление списка объявлений с Avito',
  },
  {
    icon: Columns,
    title: 'Настройка колонок таблиц',
    description: 'Персонализация отображения данных',
  },
];

export function Step09AdvancedFeatures({ onComplete, onSkip }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Дополнительные возможности</h2>
        <p className="text-muted-foreground">
          Продвинутые функции для опытных пользователей
        </p>
      </div>

      <div className="space-y-3">
        {ADVANCED_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Collapsible key={idx}>
              <CollapsibleTrigger className="w-full">
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <CardTitle className="text-sm">{feature.title}</CardTitle>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 animate-in slide-in-from-top-2 fade-in-0 duration-300">
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
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
