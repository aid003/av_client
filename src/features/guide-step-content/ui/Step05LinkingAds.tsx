'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Link, ScrollText, ArrowRight, ChevronDown, Layers, Filter, Target, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step05LinkingAds({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Привязка к объявлениям</h2>
        <p className="text-muted-foreground">
          Подключите скрипты продаж и базы знаний к вашим объявлениям для автоматизации диалогов
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Sparkles className="w-4 h-4 text-primary" />
        <AlertDescription>
          После привязки бот автоматически отвечает на сообщения по выбранным объявлениям
        </AlertDescription>
      </Alert>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Процесс привязки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">
              1
            </div>
            <div>
              <p className="font-medium mb-1">Выберите объявления</p>
              <p className="text-muted-foreground">В таблице отметьте нужные объявления (можно несколько сразу)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">
              2
            </div>
            <div>
              <p className="font-medium mb-1">Привяжите скрипт продаж</p>
              <p className="text-muted-foreground">Нажмите "Привязать скрипт" и выберите нужный из списка</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">
              3
            </div>
            <div>
              <p className="font-medium mb-1">Добавьте базу знаний (опционально)</p>
              <p className="text-muted-foreground">Для AI-ответов с учётом вашей информации о товарах</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 font-bold text-green-600">
              ✓
            </div>
            <div>
              <p className="font-medium mb-1">Готово!</p>
              <p className="text-muted-foreground">Бот начнёт автоматически отвечать на новые сообщения</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold mb-3">Возможности привязки</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Мультипривязка</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Один скрипт можно привязать к неограниченному количеству объявлений
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Приоритеты</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Если к объявлению привязано несколько скриптов, выполняется первый
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Фильтрация</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Используйте фильтры для быстрого поиска объявлений по категории или статусу
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Советы по эффективной привязке
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
              <p>✓ Сначала протестируйте скрипт на 2-3 объявлениях</p>
              <p>✓ Проверьте качество ответов в разделе "Чаты"</p>
              <p>✓ При необходимости скорректируйте скрипт</p>
              <p>✓ Затем применяйте к остальным объявлениям</p>
              <p>✓ Разные скрипты для разных категорий товаров</p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
          window.location.href = '/ads';
        }}
      >
        Управление объявлениями
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
