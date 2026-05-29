import { ONBOARDING_STEP_IDS, type OnboardingStepId, type Player, type Transaction } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import { InternalError } from '../../discord/errors.js';
import type { View } from '../../discord/types.js';
import { buildOpEmbed } from '../../discord/utils/index.js';

import { buildFishReminder, runFishStep } from './steps/step-fish.js';
import { buildKickoffReminder, runKickoff } from './steps/step-kickoff.js';

type SceneStep = {
  id: OnboardingStepId;
  type: 'scene';
  embed: (player: Player) => EmbedBuilder;
  buttonLabel?: string;
};

type MissionStep = {
  id: OnboardingStepId;
  type: 'mission';
  expects: string;
  run: (playerId: number, tx: Transaction) => Promise<View> | View;
  reminder: (prefix: string, expects: string) => View;
};

type OnboardingStep = SceneStep | MissionStep;

export const ONBOARDING_SCRIPT: ReadonlyArray<OnboardingStep> = [
  { id: 'intro', type: 'mission', expects: 'intro', run: runKickoff, reminder: buildKickoffReminder },
  { id: 'fish-mission', type: 'mission', expects: 'fish', run: runFishStep, reminder: buildFishReminder },
  { id: 'after-fish', type: 'scene', embed: buildAfterFishEmbed },
];

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
  if (STEP_BY_ID.size !== ONBOARDING_SCRIPT.length) {
    throw new InternalError(`ONBOARDING_SCRIPT contient des ids dupliqués`);
  }
  for (const id of ONBOARDING_STEP_IDS) {
    if (!STEP_BY_ID.has(id)) {
      throw new InternalError(`ONBOARDING_SCRIPT manque le step défini en DB: ${id}`);
    }
  }
}

function buildAfterFishEmbed(): EmbedBuilder {
  return buildOpEmbed('info')
    .setTitle('Tu sais pêcher.')
    .setDescription("Un poisson dans le ventre, l'horizon devant. La suite, tu l'écriras toi-même.");
}
