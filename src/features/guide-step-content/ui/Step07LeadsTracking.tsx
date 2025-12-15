'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { Users, Database, CheckCircle, ArrowRight, FileText, Filter, TrendingUp, ChevronDown, Info } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step07LeadsTracking({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Работа с лидами</h2>
        <p className="text-muted-foreground">
          Управление потенциальными клиентами и анализ извлечённых данных
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Info className="w-4 h-4 text-primary" />
        <AlertDescription>
          Лид создаётся автоматически при запуске скрипта продаж в чате с клиентом
        </AlertDescription>
      </Alert>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="text-base">Что такое лид?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            <strong>Лид</strong> - это структурированная запись о диалоге с потенциальным клиентом,
            содержащая извлечённую информацию и историю взаимодействия.
          </p>

          <div className="space-y-2">
            <p className="font-medium">Лид содержит:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Ссылку на исходный чат</li>
              <li>• ID запущенного скрипта</li>
              <li>• Все извлечённые слоты (имя, телефон, и т.д.)</li>
              <li>• Текущий блок выполнения скрипта</li>
              <li>• Статус: активный или завершённый</li>
              <li>• Временные метки создания/обновления</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold mb-3">Возможности работы с лидами</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">Слоты данных</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Автоматически извлечённая информация:</p>
              <ul className="space-y-1">
                <li>• Имя клиента</li>
                <li>• Номер телефона</li>
                <li>• Email (если запрошен)</li>
                <li>• Бюджет</li>
                <li>• Специфические требования</li>
                <li>• Любые custom слоты из скрипта</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">Статусы</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Активный:</strong> Диалог продолжается, скрипт выполняется</p>
              <p><strong>Завершённый:</strong> Достигнут блок END или диалог закрыт</p>
              <p className="text-xs mt-2">Фильтруйте по статусу для анализа воронки продаж</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">Фильтрация</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• По статусу (активные/завершённые)</p>
              <p>• По скрипту продаж</p>
              <p>• По дате создания</p>
              <p>• По чату (ID)</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-base">Аналитика</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• Конверсия скриптов</p>
              <p>• Качество извлечения данных</p>
              <p>• Время до завершения</p>
              <p>• Популярные товары</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Чем лид отличается от чата?
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Чат
                </p>
                <p className="text-muted-foreground">
                  Просто переписка между вами и клиентом. Сырые сообщения, изображения, файлы.
                  Может быть без автоматизации.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Лид
                </p>
                <p className="text-muted-foreground">
                  Структурированная CRM-запись о клиенте с извлечёнными данными (имя, телефон),
                  статусом сделки, привязкой к скрипту. Создаётся только при автоматизации.
                </p>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                <strong>Пример:</strong> Чат - "Добрый день, меня интересует ваша квартира".
                Лид - имя: Иван, телефон: +7900..., статус: активный, текущий блок: QUESTION_PRICE.
              </p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
          window.location.href = '/leads';
        }}
      >
        Просмотр лидов
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
