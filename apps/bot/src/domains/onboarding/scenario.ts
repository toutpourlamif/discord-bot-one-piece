import { type OnboardingStepId, type Transaction } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import type { View } from '../../discord/types.js';

import { buildAfterFishEmbed } from './steps/step-after-fish.js';
import { buildFishReminder, runFishStep } from './steps/step-fish.js';
import { buildKickoffReminder, runKickoff } from './steps/step-kickoff.js';

type SceneStep = {
  id: OnboardingStepId;
  type: 'scene';
  embed: () => EmbedBuilder;
  buttonLabel?: string;
};

type MissionStep = {
  id: OnboardingStepId;
  type: 'mission';
  expects: string;
  run: (playerId: number, tx: Transaction) => Promise<View> | View;
  reminder: (prefix: string, expects: string) => View;
};

export type OnboardingStep = SceneStep | MissionStep;

export const ONBOARDING_SCENARIO: ReadonlyArray<OnboardingStep> = [
  { id: 'intro', type: 'mission', expects: 'intro', run: runKickoff, reminder: buildKickoffReminder },
  { id: 'fish-mission', type: 'mission', expects: 'fish', run: runFishStep, reminder: buildFishReminder },
  { id: 'after-fish', type: 'scene', embed: buildAfterFishEmbed },
];
