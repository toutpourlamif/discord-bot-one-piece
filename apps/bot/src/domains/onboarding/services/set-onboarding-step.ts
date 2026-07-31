import type { OnboardingStepId } from '@one-piece/db';

import * as playerRepository from '../../player/repository.js';
import { getStepPosition } from '../step-registry.js';
import type { OnboardingStepChange } from '../utils/build-onboarding-step-change-message.js';

export async function setOnboardingStep(playerId: number, targetStep: OnboardingStepId | null): Promise<OnboardingStepChange> {
  const player = await playerRepository.findByIdOrThrow(playerId);
  const previousStep = player.onboardingStep;
  await playerRepository.setOnboardingStep(playerId, targetStep);
  return { previousStep, targetStep, delta: getStepPosition(targetStep) - getStepPosition(previousStep) };
}
