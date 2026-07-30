import { ONBOARDING_STEP_IDS, type OnboardingStepId } from '@one-piece/db';

import { InternalError, NotFoundError, ValidationError } from '../../discord/errors.js';

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
  const next = ONBOARDING_SCENARIO[getStepPosition(id) + 1];
  return next ? next.id : null;
}

/** Position dans le scénario (0-indexed). `null` (onboarding terminé) vaut la position juste après le dernier step. */
export function getStepPosition(id: OnboardingStepId | null): number {
  if (id === null) return ONBOARDING_SCENARIO.length;
  const index = ONBOARDING_SCENARIO.findIndex((step) => step.id === id);
  if (index === -1) throw new InternalError(`Step d'onboarding introuvable: ${id}`);
  return index;
}

/** Résout un nom de step tapé à la main (ex: `!setob coin flip throw`) — exact d'abord, sinon sous-chaîne unique. */
export function findStepByFuzzyIdOrThrow(query: string): OnboardingStep {
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, '-');

  const exactMatch = ONBOARDING_SCENARIO.find((step) => step.id === normalizedQuery);
  if (exactMatch) return exactMatch;

  const partialMatches = ONBOARDING_SCENARIO.filter((step) => step.id.includes(normalizedQuery));
  if (partialMatches.length === 1) return partialMatches[0]!;
  if (partialMatches.length > 1) {
    const ids = partialMatches.map((step) => step.id).join(', ');
    throw new ValidationError(`Plusieurs steps matchent "${query}" : ${ids}`);
  }
  throw new NotFoundError(`Step d'onboarding introuvable : ${query}`);
}

function assertScenarioIntegrity(): void {
  if (STEP_BY_ID.size !== ONBOARDING_SCENARIO.length) throw new InternalError(`ONBOARDING_SCENARIO contient des ids dupliqués`);
  for (const id of ONBOARDING_STEP_IDS) {
    if (!STEP_BY_ID.has(id)) throw new InternalError(`ONBOARDING_SCENARIO manque le step défini en DB: ${id}`);
  }
}
