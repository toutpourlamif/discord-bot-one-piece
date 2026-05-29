import { db } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseStringArg } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import { advanceOnboarding } from '../services/advance-onboarding.js';
import { buildOnboardingCompletedView, buildOnboardingView } from '../view.js';

export const onboardingNextButtonHandler: ButtonHandler = {
  name: ONBOARDING_NEXT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    await interaction.deferUpdate();

    const stepId = parseStringArg(args[0], 'stepId manquant dans le customId');
    const { player } = await findOrCreatePlayer(interaction.user.id, interaction.user.username, interaction.guildId!);

    const resultingStep = await db.transaction(async (tx) => {
      const locked = await playerRepository.findByIdOrThrow(player.id, tx, { forUpdate: true });
      if (locked.onboardingStep !== stepId) return locked.onboardingStep;
      const { nextStep } = await advanceOnboarding(player.id, tx);
      return nextStep;
    });

    const view =
      resultingStep === null ? buildOnboardingCompletedView() : buildOnboardingView({ ...player, onboardingStep: resultingStep });
    await interaction.editReply(view);
  },
};
