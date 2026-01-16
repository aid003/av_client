'use client';

import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/shared/ui/components/ui/label';
import { Input } from '@/shared/ui/components/ui/input';
import { Textarea } from '@/shared/ui/components/ui/textarea';
import { Switch } from '@/shared/ui/components/ui/switch';
import { Button } from '@/shared/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip';
import type { MultiRouterBlockConfig, MultiRouterQuestion } from '@/entities/sales-script';

interface MultiRouterBlockFormProps {
  config: MultiRouterBlockConfig;
  onUpdate: (config: Partial<MultiRouterBlockConfig>) => void;
}

export function MultiRouterBlockForm({ config, onUpdate }: MultiRouterBlockFormProps) {
  const questions = config.questions || [];
  const canAddQuestion = questions.length < 20;

  const updateQuestions = (nextQuestions: MultiRouterQuestion[]) => {
    onUpdate({ questions: nextQuestions });
  };

  const handleQuestionChange = (index: number, updates: Partial<MultiRouterQuestion>) => {
    updateQuestions(
      questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...updates } : question
      )
    );
  };

  const handleAddQuestion = () => {
    const nextIndex = questions.length + 1;
    updateQuestions([
      ...questions,
      {
        id: `option_${nextIndex}`,
        text: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    updateQuestions(questions.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleMinConfidenceChange = (value: string) => {
    if (!value) {
      onUpdate({ minConfidence: undefined });
      return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      onUpdate({ minConfidence: undefined });
      return;
    }

    const normalized = Math.min(1, Math.max(0, parsed));
    onUpdate({ minConfidence: normalized });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="multi-router-instruction">Инструкция для ИИ</Label>
        <Textarea
          id="multi-router-instruction"
          value={config.instruction || ''}
          onChange={(e) => onUpdate({ instruction: e.target.value })}
          placeholder="Как выбирать подходящую тему..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Варианты (1–20)</Label>
        <div className="space-y-2">
          {questions.length === 0 && (
            <div className="text-xs text-muted-foreground">
              Добавьте хотя бы один вариант — для каждого появится отдельная ветка.
            </div>
          )}
          {questions.map((question, index) => (
            <div key={`${question.id}-${index}`} className="flex items-start gap-2">
              <Input
                value={question.id}
                onChange={(e) => handleQuestionChange(index, { id: e.target.value })}
                placeholder="id"
                className="w-32"
              />
              <Input
                value={question.text}
                onChange={(e) => handleQuestionChange(index, { text: e.target.value })}
                placeholder="Тема/формулировка"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemoveQuestion(index)}
                title="Удалить вариант"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddQuestion}
          disabled={!canAddQuestion}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить вариант
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="multi-router-min-confidence">Минимальная уверенность</Label>
        <Input
          id="multi-router-min-confidence"
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={config.minConfidence ?? ''}
          onChange={(e) => handleMinConfidenceChange(e.target.value)}
          placeholder="0.6"
        />
        <div className="text-xs text-muted-foreground">
          Если уверенность ниже порога — будет выбран fallback.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="multi-router-defer-until-next-user">Отложить ветвление</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Если перед блоком был ответ бота, дождется следующего сообщения пользователя
                и только потом выберет ветку. Если блок идет сразу после START, ветвление
                произойдет сразу.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="multi-router-defer-until-next-user"
          checked={config.deferUntilNextUser ?? false}
          onCheckedChange={(checked) => onUpdate({ deferUntilNextUser: checked })}
        />
      </div>
    </div>
  );
}
