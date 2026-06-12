import { db } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, parseOwnerDiscordId, parseStringArg } from '../../../discord/utils/index.js';
import { requireGuildId } from '../../guild/index.js';
import * as guildRepository from '../../guild/repository.js';
import * as playerRepository from '../../player/repository.js';
import { ONBOARDING_NEXT_BUTTON_NAME } from '../constants.js';
import * as onboardingService from '../services/index.js';
import { buildOnboardingCompletedView } from '../views/build-onboarding-completed-view.js';
import { buildOnboardingView } from '../views/build-onboarding-view.js';

export const onboardingNextButtonHandler: ButtonHandler = {
  name: ONBOARDING_NEXT_BUTTON_NAME,
  async handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    const ownerDiscordId = parseOwnerDiscordId(args[0]);
    assertInteractorIsTheOwner(interaction, ownerDiscordId);
    await interaction.deferUpdate();

    const stepId = parseStringArg(args[1], 'stepId manquant dans le customId');
    const guild = await guildRepository.findOrCreate(requireGuildId(interaction.guildId), interaction.guild!.name);
    const player = await playerRepository.findByDiscordIdOrThrow(ownerDiscordId);

    const resultingStep = await db.transaction(async (tx) => {
      const locked = await playerRepository.findByIdOrThrow(player.id, tx, { forUpdate: true });
      if (locked.onboardingStep !== stepId) return locked.onboardingStep;
      const { nextStep } = await onboardingService.advanceOnboarding(player.id, tx);
      return nextStep;
    });

    const view =
      resultingStep === null
        ? buildOnboardingCompletedView(guild.language)
        : buildOnboardingView({ stepId: resultingStep, prefix: guild.prefix, ownerDiscordId });
    await interaction.editReply(view);
  },
};
