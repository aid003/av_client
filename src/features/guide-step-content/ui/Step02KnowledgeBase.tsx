'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { BookText, FileText, Lightbulb, ArrowRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/components/ui/collapsible';
import type { StepContentProps } from '@/widgets/guide-wizard/model/types';

export function Step02KnowledgeBase({ onComplete }: StepContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Создание базы знаний</h2>
        <p className="text-muted-foreground">
          Загрузите информацию о ваших товарах и услугах для умных ответов AI
        </p>
      </div>

      <Alert className="border-primary/50 bg-primary/5">
        <Lightbulb className="w-4 h-4 text-primary" />
        <AlertDescription>
          AI будет искать ответы в вашей базе знаний, чтобы отвечать точно и по делу
        </AlertDescription>
      </Alert>

      <div>
        <h3 className="text-sm font-medium mb-3">Поддерживаемые форматы</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['PDF', 'TXT', 'DOCX', 'MD'].map((format) => (
            <div
              key={format}
              className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{format}</span>
            </div>
          ))}
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <ChevronDown className="w-4 h-4" />
          Best practices для базы знаний
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2 text-sm">
              <p>✓ Структурируйте информацию по темам</p>
              <p>✓ Используйте простой язык без жаргона</p>
              <p>✓ Включайте FAQ и типичные вопросы клиентов</p>
              <p>✓ Обновляйте базу при изменении информации</p>
              <p>✓ Рекомендуемый размер файлов: до 10 МБ</p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookText className="w-4 h-4" />
            Как это работает (RAG)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Ваши документы разбиваются на фрагменты и сохраняются в векторную базу данных.
            Когда AI генерирует ответ, он сначала ищет релевантные фрагменты из вашей базы,
            а затем формулирует ответ на их основе.
          </p>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full hover:scale-105 active:scale-95 transition-transform"
        onClick={() => {
          onComplete();
          window.location.href = '/knowledge-base';
        }}
      >
        Создать базу знаний
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
