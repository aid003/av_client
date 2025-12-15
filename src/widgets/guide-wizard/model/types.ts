import { type ComponentType } from 'react';

export interface StepContentProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export interface TechnicalTerm {
  term: string;
  tooltip: string;
  detailedExplanation?: string;
  exampleUseCase?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  category: 'technical' | 'business' | 'troubleshooting';
}

export interface WizardStep {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  estimatedTime: string;
  component: ComponentType<StepContentProps>;
  canSkip: boolean;
  requiredForCompletion: boolean;
  technicalTerms?: TechnicalTerm[];
  faqs?: FAQ[];
  screenshots?: string[];
}

export interface ModalData {
  type: 'technical' | 'faq' | 'screenshot' | null;
  data?: any;
}

export interface GuideWizardStore {
  // Навигация
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  visitedSteps: Set<number>;
  prevStep: number;

  // Модалы
  activeModal: ModalData;

  // Actions
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  markStepComplete: (step: number) => void;
  openModal: (type: ModalData['type'], data?: any) => void;
  closeModal: () => void;
  reset: () => void;
}
