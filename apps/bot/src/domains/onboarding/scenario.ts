import { type OnboardingStepId, type SupportedLanguage, type Transaction } from '@one-piece/db';
import type { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

import type { View } from '../../discord/types.js';

import { buildAfterFishEmbed } from './steps/step-after-fish.js';
import { crewSteps } from './steps/step-crew.js';
import { buildFishReminder, runFishStep } from './steps/step-fish.js';
import { goldRogerSteps } from './steps/step-gold-roger.js';
import { buildInfoMissionReminder, matchesOroJacksonQuery, runInfoMission } from './steps/step-info.js';
import { inventorySteps } from './steps/step-inventory.js';
import { buildKickoffReminder, runKickoff } from './steps/step-kickoff.js';
import { storytellerSteps } from './steps/step-storyteller.js';

export type SceneStep = {
  id: OnboardingStepId;
  type: 'scene';
  embed: () => EmbedBuilder;
  buttonLabel?: string;
  /** Hack pour les scenes à boutons multiples (comme quand on parle au conteur) — remplace le bouton "Continuer" par défaut. */
  buildComponents?: (params: { stepId: OnboardingStepId; ownerDiscordId: string }) => Array<ActionRowBuilder<ButtonBuilder>>;
  /**
   * Effet de bord déclenché par le clic "Continuer" (ex: octroi d'item), exécuté dans la même tx que l'avancement.
   * Peut renvoyer un écran de conséquence (ex: "objet obtenu") affiché avant le step suivant — non persisté en DB,
   * donc jamais revisitable et jamais rejoué si on retape la commande d'onboarding après coup.
   */
  onAdvance?: (playerId: number, tx: Transaction) => Promise<View | undefined> | View | undefined;
};

export type MissionStep = {
  id: OnboardingStepId;
  type: 'mission';
  expects: string;
  /** Au-delà du nom de commande, valide les args tapés (ex: `!info oro jackson`). Absent = tous les args passent. */
  matchesArgs?: (args: Array<string>) => boolean;
  run: (playerId: number, tx: Transaction) => Promise<View> | View;
  reminder: (prefix: string, language: SupportedLanguage) => View;
};

export type OnboardingStep = SceneStep | MissionStep;

export const ONBOARDING_SCENARIO: ReadonlyArray<OnboardingStep> = [
  { id: 'intro', type: 'mission', expects: 'intro', run: runKickoff, reminder: buildKickoffReminder },
  ...goldRogerSteps,
  ...storytellerSteps,
  {
    id: 'info-mission',
    type: 'mission',
    expects: 'info',
    matchesArgs: matchesOroJacksonQuery,
    run: runInfoMission,
    reminder: buildInfoMissionReminder,
  },
  ...crewSteps,
  ...inventorySteps,
  { id: 'fish-mission', type: 'mission', expects: 'fish', run: runFishStep, reminder: buildFishReminder },
  { id: 'after-fish', type: 'scene', embed: buildAfterFishEmbed },
];
