'use client';

import { Progress } from '@/shared/ui/components/ui/progress';
import { cn } from '@/shared/lib/utils';
import { useGuideWizardStore } from '../model/store';
import { WIZARD_STEPS } from '../model/steps-data';
import { useIsMobile } from '@/shared/hooks';

export function WizardProgressBar() {
  const { currentStep, totalSteps, goToStep, completedSteps } = useGuideWizardStore();
  const isMobile = useIsMobile();

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const maxCompletedStep = Math.max(...Array.from(completedSteps), -1);

  if (isMobile) {
    // Mobile: простой прогресс-бар без точек
    return (
      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-2 transition-all duration-700 ease-out"
        />
      </div>
    );
  }

  // Desktop: прогресс-бар + интерактивные точки
  return (
    <div className="space-y-3">
      <Progress
        value={progress}
        className="h-3 transition-all duration-700 ease-out"
      />

      <div className="hidden md:flex justify-between items-center">
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isAccessible = idx <= maxCompletedStep + 1;

          return (
            <button
              key={idx}
              onClick={() => isAccessible && goToStep(idx)}
              disabled={!isAccessible}
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                isCurrent && 'scale-110',
                !isAccessible && 'opacity-40 cursor-not-allowed'
              )}
              title={step.title}
            >
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-300',
                  isCompleted && 'bg-primary scale-125',
                  isCurrent && 'bg-primary ring-4 ring-primary/20',
                  !isCompleted && !isCurrent && 'bg-muted',
                  isAccessible && !isCurrent && 'hover:bg-primary/50 cursor-pointer'
                )}
              />
              {isCurrent && (
                <span className="text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  {step.shortTitle}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
