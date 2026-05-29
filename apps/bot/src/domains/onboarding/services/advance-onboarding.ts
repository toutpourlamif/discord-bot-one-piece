import type { OnboardingStepId, Transaction } from '@one-piece/db';

import { InternalError } from '../../../discord/errors.js';
import { getLatestProcessableBucket } from '../../event/engine/bucket.js';
import * as historyRepository from '../../history/index.js';
import * as playerRepository from '../../player/repository.js';
import { getNextStepId } from '../script.js';

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

  if (nextStep === null) {
    // On évite que le moteur de monde rejoue tous les buckets accumulés pendant l'onboarding.
    await playerRepository.setLastProcessedBucketId(playerId, getLatestProcessableBucket(), tx);
  }

  return { previousStep: currentStep, nextStep };
}
