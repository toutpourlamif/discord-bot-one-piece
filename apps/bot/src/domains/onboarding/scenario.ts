import type { Guild, OnboardingStepId, Transaction } from '@one-piece/db';
import type { EmbedBuilder } from 'discord.js';

import type { Command, View } from '../../discord/types.js';
import { fishingCommand } from '../fishing/commands/fishing.js';

import { introCommand } from './commands/intro.js';
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
  command: Command;
  run: (playerId: number, tx: Transaction) => Promise<View> | View;
  reminder: (guild: Guild, command: Command) => View;
};

export type OnboardingStep = SceneStep | MissionStep;

export const ONBOARDING_SCENARIO: ReadonlyArray<OnboardingStep> = [
  { id: 'intro', type: 'mission', expects: 'intro', command: introCommand, run: runKickoff, reminder: buildKickoffReminder },
  { id: 'fish-mission', type: 'mission', expects: 'fish', command: fishingCommand, run: runFishStep, reminder: buildFishReminder },
  { id: 'after-fish', type: 'scene', embed: buildAfterFishEmbed },
];
