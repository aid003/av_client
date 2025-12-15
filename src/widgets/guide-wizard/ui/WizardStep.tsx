'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { useGuideWizardStore } from '../model/store';
import { WIZARD_STEPS } from '../model/steps-data';

export function WizardStep() {
  const { currentStep, prevStep, markStepComplete, nextStep } = useGuideWizardStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const currentStepData = WIZARD_STEPS[currentStep];
  const StepComponent = currentStepData?.component;

  // Determine animation direction
  const isForward = currentStep > prevStep;
  const direction = isForward ? 'right' : 'left';

  // Auto-scroll to top and focus on step change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      contentRef.current.focus();
    }
  }, [currentStep]);

  if (!StepComponent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Step not found</p>
      </div>
    );
  }

  const handleComplete = () => {
    markStepComplete(currentStep);
    // Автоматически переходим на следующий шаг после завершения
    nextStep();
  };

  const handleSkip = () => {
    nextStep();
  };

  return (
    <div
      ref={contentRef}
      tabIndex={-1}
      className="outline-none focus:outline-none"
    >
      <div
        key={currentStep}
        className={cn(
          'animate-in fade-in-0 duration-500',
          direction === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
        )}
      >
        <StepComponent onComplete={handleComplete} onSkip={handleSkip} />
      </div>
    </div>
  );
}
