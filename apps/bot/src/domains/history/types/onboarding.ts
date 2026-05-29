import type { OnboardingStepId } from '@one-piece/db';

export type OnboardingLog = {
  type: 'onboarding.stepCompleted';
  payload: { step: OnboardingStepId };
};
