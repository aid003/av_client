'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { MessageSquare, Bot, User, ArrowRight, Eye, Clock, ChevronDown, MessageCircle } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step06ChatsOverview({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Мониторинг чатов</h2>
        <p className="text-muted-foreground">
          Отслеживайте диалоги с покупателями в реальном времени и контролируйте работу бота
        </p>
      </div>

      <Alert className="border-green-500/50 bg-green-500/5">
        <Eye className="w-4 h-4 text-green-500" />
        <AlertDescription>
          Видите все диалоги: и автоматические ответы бота, и ручные сообщения
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-sm font-semibold mb-3">Возможности раздела "Чаты"</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-base">Автоматические ответы</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• Бот следует заданному скрипту</p>
              <p>• Извлекает данные в слоты</p>
              <p>• Использует AI для ответов</p>
              <p>• Помечены специальным значком</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-base">Ручное вмешательство</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• В любой момент можете ответить сами</p>
              <p>• Бот автоматически приостановится</p>
              <p>• Полный контроль над диалогом</p>
              <p>• Переключение туда-обратно</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-base">История диалогов</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• Полная переписка с клиентом</p>
              <p>• Отображение изображений</p>
              <p>• Цитируемые сообщения</p>
              <p>• Контекст объявления (u2i чаты)</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-base">Фильтры и поиск</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• Фильтр по типу чата (u2i/u2u)</p>
              <p>• Поиск по тексту</p>
              <p>• Сортировка по дате</p>
              <p>• Просмотр активных диалогов</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Типы сообщений в чатах
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-medium mb-2">Система поддерживает следующие типы:</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <p>• Текстовые сообщения</p>
                <p>• Изображения</p>
                <p>• Видео</p>
                <p>• Голосовые сообщения</p>
                <p>• Файлы</p>
                <p>• Ссылки</p>
                <p>• Геолокация</p>
                <p>• Системные уведомления</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-yellow-600" />
            Чем отличаются u2i и u2u чаты?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>u2i (user-to-item):</strong> Переписка по конкретному объявлению. Видна информация о товаре.</p>
          <p><strong>u2u (user-to-user):</strong> Общая переписка между пользователями без привязки к объявлению.</p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
          window.location.href = '/chats';
        }}
      >
        Открыть чаты
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
