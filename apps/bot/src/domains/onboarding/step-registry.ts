import { ONBOARDING_STEP_IDS, type OnboardingStepId } from '@one-piece/db';

import { InternalError } from '../../discord/errors.js';

import { ONBOARDING_SCENARIO, type OnboardingStep } from './scenario.js';

const STEP_BY_ID = new Map<OnboardingStepId, OnboardingStep>(ONBOARDING_SCENARIO.map((step) => [step.id, step]));

assertScenarioIntegrity();

export function getStep(id: OnboardingStepId): OnboardingStep {
  const step = STEP_BY_ID.get(id);
  if (!step) throw new InternalError(`Step d'onboarding introuvable: ${id}`);
  return step;
}

export function getFirstStepId(): OnboardingStepId {
  const [firstStep] = ONBOARDING_SCENARIO;
  if (!firstStep) throw new InternalError(`ONBOARDING_SCENARIO est vide`);
  return firstStep.id;
}

export function getNextStepId(id: OnboardingStepId): OnboardingStepId | null {
  const index = ONBOARDING_SCENARIO.findIndex((step) => step.id === id);
  if (index === -1) throw new InternalError(`Step d'onboarding introuvable: ${id}`);
  const next = ONBOARDING_SCENARIO[index + 1];
  return next ? next.id : null;
}

function assertScenarioIntegrity(): void {
  if (STEP_BY_ID.size !== ONBOARDING_SCENARIO.length) throw new InternalError(`ONBOARDING_SCENARIO contient des ids dupliqués`);
  for (const id of ONBOARDING_STEP_IDS) {
    if (!STEP_BY_ID.has(id)) throw new InternalError(`ONBOARDING_SCENARIO manque le step défini en DB: ${id}`);
  }
}
