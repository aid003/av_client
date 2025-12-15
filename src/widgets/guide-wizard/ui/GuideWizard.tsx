'use client';

import { useEffect } from 'react';
import { WizardProgressBar } from './WizardProgressBar';
import { WizardStepIndicator } from './WizardStepIndicator';
import { WizardNavigation } from './WizardNavigation';
import { WizardStep } from './WizardStep';
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area';
import { useGuideWizardStore } from '../model/store';

export function GuideWizard() {
  const { currentStep, totalSteps, previousStep, nextStep, activeModal, closeModal } =
    useGuideWizardStore();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if modal is open or user is in an input
      if (
        activeModal.type ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          if (currentStep < totalSteps - 1) {
            e.preventDefault();
            nextStep();
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            e.preventDefault();
            previousStep();
          }
          break;
        case 'Escape':
          if (activeModal.type) {
            e.preventDefault();
            closeModal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, activeModal, nextStep, previousStep, closeModal]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header: Progress Bar + Step Indicator */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <WizardStepIndicator />
        </div>
        <WizardProgressBar />
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 pt-4">
        <div className="px-3 md:px-6 pb-4">
          <WizardStep />
        </div>
      </ScrollArea>

      {/* Footer: Navigation */}
      <div
        className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/30 px-3 md:px-6"
        style={{ 
          paddingTop: '0.5rem', 
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 0.125rem), 0.125rem)',
          marginBottom: 0
        }}
      >
        <WizardNavigation />
      </div>
    </div>
  );
}
