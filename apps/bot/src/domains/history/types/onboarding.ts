import type { OnboardingStepId } from '@one-piece/db';

type OnboardingStepCompletedLog = {
  type: 'onboarding.stepCompleted';
  payload: { step: OnboardingStepId };
};

type OnboardingCompletedLog = {
  type: 'onboarding.completed';
  payload: Record<string, never>;
};

export type OnboardingLog = OnboardingStepCompletedLog | OnboardingCompletedLog;
