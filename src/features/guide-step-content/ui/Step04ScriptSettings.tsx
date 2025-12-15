'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Settings, Thermometer, Variable, Clock, ArrowRight, ChevronDown, Brain, Zap, Timer } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step04ScriptSettings({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Настройка скрипта продаж</h2>
        <p className="text-muted-foreground">
          Тонкая настройка поведения AI и параметров диалога для достижения наилучших результатов
        </p>
      </div>

      <Alert className="border-blue-500/50 bg-blue-500/5">
        <Thermometer className="w-4 h-4 text-blue-500" />
        <AlertDescription>
          <strong>Совет:</strong> Рекомендуемая температура 0.7 обеспечивает баланс между креативностью и точностью ответов
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-lg font-semibold mb-3">Основные настройки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">LLM модели</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Выбор моделей для разных операций:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Генерация ответов (GPT-4, Claude)</li>
                <li>• Классификация YES/NO/OTHER</li>
                <li>• Извлечение слотов</li>
                <li>• Проверка релевантности</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Variable className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">Слоты (переменные)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Автоматическое извлечение данных клиента:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Имя и контакты</li>
                <li>• Требования к товару/услуге</li>
                <li>• Бюджет</li>
                <li>• Срочность покупки</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-base">Температура</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Контролирует случайность ответов:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 0.0-0.3: Очень точные ответы</li>
                <li>• 0.4-0.7: Баланс (рекомендуется)</li>
                <li>• 0.8-1.0: Креативные ответы</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">Задержки ответов</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Имитация естественного общения:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Первое сообщение: 2-3 сек</li>
                <li>• Последующие: 1-2 сек</li>
                <li>• Создаёт эффект "печатает..."</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Продвинутые настройки
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Максимальные токены</p>
                <p className="text-muted-foreground">Ограничение длины генерируемых ответов (512-2048 токенов)</p>
              </div>
              <div>
                <p className="font-medium mb-1">Автозаполнение слотов</p>
                <p className="text-muted-foreground">Извлечение данных из первого сообщения клиента автоматически</p>
              </div>
              <div>
                <p className="font-medium mb-1">Агрегация сообщений</p>
                <p className="text-muted-foreground">Объединение быстрых сообщений клиента в одно (окно 10 сек)</p>
              </div>
              <div>
                <p className="font-medium mb-1">Стиль ответов</p>
                <p className="text-muted-foreground">SHORT (краткие), NORMAL (обычные), DETAILED (подробные)</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Тестируйте разные температуры для вашей ниши</p>
          <p>✓ Начинайте с 0.7 и корректируйте по результатам</p>
          <p>✓ Используйте слоты для персонализации ответов</p>
          <p>✓ Настраивайте задержки под естественный темп общения</p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
        }}
      >
        Продолжить
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
