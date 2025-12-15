import { create } from 'zustand';
import type { GuideWizardStore, ModalData } from './types';

const TOTAL_STEPS = 10;

export const useGuideWizardStore = create<GuideWizardStore>((set, get) => ({
  // Начальное состояние
  currentStep: 0,
  totalSteps: TOTAL_STEPS,
  completedSteps: new Set<number>(),
  visitedSteps: new Set<number>([0]),
  prevStep: 0,

  activeModal: {
    type: null,
    data: undefined,
  },

  // Навигация
  goToStep: (step: number) => {
    const { totalSteps, currentStep } = get();
    if (step >= 0 && step < totalSteps) {
      set((state) => ({
        prevStep: currentStep,
        currentStep: step,
        visitedSteps: new Set([...state.visitedSteps, step]),
      }));
    }
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      get().goToStep(currentStep + 1);
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      get().goToStep(currentStep - 1);
    }
  },

  markStepComplete: (step: number) => {
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    }));
  },

  // Модалы
  openModal: (type: ModalData['type'], data?: any) => {
    set({
      activeModal: {
        type,
        data,
      },
    });
  },

  closeModal: () => {
    set({
      activeModal: {
        type: null,
        data: undefined,
      },
    });
  },

  // Сброс
  reset: () => {
    set({
      currentStep: 0,
      completedSteps: new Set<number>(),
      visitedSteps: new Set<number>([0]),
      prevStep: 0,
      activeModal: {
        type: null,
        data: undefined,
      },
    });
  },
}));
