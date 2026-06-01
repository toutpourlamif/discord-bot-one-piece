import type { OnboardingStepId, Transaction } from '@one-piece/db';

import { InternalError } from '../../../discord/errors.js';
import { getLatestProcessableBucket } from '../../event/engine/bucket.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { getNextStepId } from '../step-registry.js';

type AdvanceResult = { previousStep: OnboardingStepId; nextStep: OnboardingStepId | null };

export async function advanceOnboarding(playerId: number, tx: Transaction): Promise<AdvanceResult> {
  const player = await playerRepository.findByIdOrThrow(playerId, tx, { forUpdate: true });
  const currentStep = player.onboardingStep;
  if (currentStep === null) throw new InternalError(`advanceOnboarding appelé alors que l'onboarding est terminé`);

  const nextStep = getNextStepId(currentStep);
  await playerRepository.setOnboardingStep(playerId, nextStep, tx);

  await historyRepository.appendHistory({
    type: 'onboarding.stepCompleted',
    actorPlayerId: playerId,
    payload: { step: currentStep },
    client: tx,
  });

  const isOnboardingFinished = nextStep === null;

  if (isOnboardingFinished) await playerRepository.setLastProcessedBucketId(playerId, getLatestProcessableBucket(), tx);

  return { previousStep: currentStep, nextStep };
}
