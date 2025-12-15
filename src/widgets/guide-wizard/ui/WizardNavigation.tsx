'use client';

import { Button } from '@/shared/ui/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGuideWizardStore } from '../model/store';
import { WIZARD_STEPS } from '../model/steps-data';
import { useIsMobile } from '@/shared/hooks';
import { cn } from '@/shared/lib/utils';

export function WizardNavigation() {
  const { currentStep, totalSteps, nextStep, previousStep } = useGuideWizardStore();
  const isMobile = useIsMobile();

  const currentStepData = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div
      className={cn(
        'flex gap-3',
        isMobile ? 'flex-col-reverse' : 'flex-row items-center justify-between'
      )}
    >
      {/* Back button */}
      <Button
        variant="outline"
        onClick={previousStep}
        disabled={isFirstStep}
        size={isMobile ? 'default' : 'default'}
        className={cn(
          'gap-2',
          isMobile && 'w-full'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Назад
      </Button>

      <div className={cn('flex gap-2', isMobile && 'w-full flex-col')}>
        {/* Skip button (if allowed) */}
        {currentStepData?.canSkip && !isLastStep && (
          <Button
            variant="ghost"
            onClick={nextStep}
            size={isMobile ? 'default' : 'default'}
            className={cn(
              'text-muted-foreground',
              isMobile && 'w-full order-2'
            )}
          >
            Пропустить
          </Button>
        )}

        {/* Next button */}
        <Button
          onClick={nextStep}
          disabled={isLastStep}
          size={isMobile ? 'default' : 'default'}
          className={cn(
            'gap-2 min-w-[120px]',
            isMobile && 'w-full order-1'
          )}
        >
          {isLastStep ? 'Завершить' : 'Далее'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
