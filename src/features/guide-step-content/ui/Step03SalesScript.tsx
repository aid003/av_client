'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import {
  Play,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Bot,
  StopCircle,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

const BLOCK_TYPES = [
  {
    type: 'START',
    icon: Play,
    title: 'Начало',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    description: 'Точка входа в скрипт',
  },
  {
    type: 'MESSAGE',
    icon: MessageSquare,
    title: 'Сообщение',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    description: 'Отправить текст клиенту',
  },
  {
    type: 'QUESTION',
    icon: HelpCircle,
    title: 'Вопрос',
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    description: 'Задать вопрос и сохранить ответ',
  },
  {
    type: 'ROUTER',
    icon: GitBranch,
    title: 'Условие',
    color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    description: 'Разветвление по условию',
  },
  {
    type: 'LLM_REPLY',
    icon: Bot,
    title: 'AI ответ',
    color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    description: 'Умный ответ от AI',
  },
  {
    type: 'END',
    icon: StopCircle,
    title: 'Конец',
    color: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    description: 'Завершить диалог',
  },
];

export function Step03SalesScript({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Создание скрипта продаж</h2>
        <p className="text-muted-foreground">
          Визуальный редактор для автоматизации диалогов с покупателями
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Sparkles className="w-4 h-4 text-primary" />
        <AlertDescription>
          Навыки программирования не требуются! Просто соединяйте блоки.
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-sm font-medium mb-3">Типы блоков</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BLOCK_TYPES.map((block) => {
            const Icon = block.icon;
            return (
              <Card
                key={block.type}
                className="cursor-pointer hover:border-primary transition-colors"
              >
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${block.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-sm">{block.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground">{block.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Пример простого скрипта
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <StopCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Начало → Отправить приветствие → Конец
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
          window.location.href = '/sales-scripts/new';
        }}
      >
        Создать мой первый скрипт
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
