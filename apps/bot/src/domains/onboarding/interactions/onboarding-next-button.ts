import { db } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import { advanceOnboarding } from '../services/advance-onboarding.js';
import { buildOnboardingCompletedView, buildOnboardingView } from '../view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  await interaction.deferUpdate();

  const stepId = args[0];
  if (!stepId) return;

  const { player } = await findOrCreatePlayer(interaction.user.id, interaction.user.username, interaction.guildId!);

  const result = await db.transaction(async (tx) => {
    // Verrou + re-lecture : un clic obsolète (player déjà avancé via une autre interaction) doit
    // tomber sur la branche `stale` plutôt que faire avancer de deux steps.
    const locked = await playerRepository.findByIdOrThrow(player.id, tx, { forUpdate: true });
    if (locked.onboardingStep !== stepId) {
      return { kind: 'stale' as const, current: locked };
    }
    const { nextStep } = await advanceOnboarding(player.id, tx);
    return { kind: 'advanced' as const, nextStep };
  });

  if (result.kind === 'stale') {
    const view =
      result.current.onboardingStep === null ? buildOnboardingCompletedView() : buildOnboardingView(result.current);
    await interaction.editReply(view);
    return;
  }

  const view =
    result.nextStep === null
      ? buildOnboardingCompletedView()
      : buildOnboardingView({ ...player, onboardingStep: result.nextStep });
  await interaction.editReply(view);
}

export const onboardingNextButtonHandler: ButtonHandler = {
  name: ONBOARDING_NEXT_BUTTON_NAME,
  handle,
};
