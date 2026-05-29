import { ONBOARDING_STEP_IDS, type OnboardingStepId } from '@one-piece/db';

import { InternalError } from '../../discord/errors.js';

import { ONBOARDING_SCRIPT, type OnboardingStep } from './script.js';

const STEP_BY_ID = new Map<OnboardingStepId, OnboardingStep>(ONBOARDING_SCRIPT.map((step) => [step.id, step]));

assertScriptIntegrity();

export function getStep(id: OnboardingStepId): OnboardingStep {
  const step = STEP_BY_ID.get(id);
  if (!step) throw new InternalError(`Step d'onboarding introuvable: ${id}`);
  return step;
}

export function getNextStepId(id: OnboardingStepId): OnboardingStepId | null {
  const index = ONBOARDING_SCRIPT.findIndex((step) => step.id === id);
  if (index === -1) throw new InternalError(`Step d'onboarding introuvable: ${id}`);
  const next = ONBOARDING_SCRIPT[index + 1];
  return next ? next.id : null;
}

function assertScriptIntegrity(): void {
  if (STEP_BY_ID.size !== ONBOARDING_SCRIPT.length) throw new InternalError(`ONBOARDING_SCRIPT contient des ids dupliqués`);
  for (const id of ONBOARDING_STEP_IDS) {
    if (!STEP_BY_ID.has(id)) throw new InternalError(`ONBOARDING_SCRIPT manque le step défini en DB: ${id}`);
  }
}
