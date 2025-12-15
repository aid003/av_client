'use client';

import { Badge } from '@/shared/ui/components/ui/badge';
import { Clock } from 'lucide-react';
import { useGuideWizardStore } from '../model/store';
import { WIZARD_STEPS } from '../model/steps-data';

export function WizardStepIndicator() {
  const { currentStep, totalSteps } = useGuideWizardStore();
  const currentStepData = WIZARD_STEPS[currentStep];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Badge variant="outline" className="text-base font-medium">
        Шаг {currentStep + 1} из {totalSteps}
      </Badge>
      {currentStepData && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{currentStepData.estimatedTime}</span>
        </div>
      )}
    </div>
  );
}
