import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, editReply, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { assertPlayerIsNotAtSea } from '../../navigation/guards/index.js';
import * as playerRepository from '../../player/repository.js';
import { TAVERN_BUTTON_NAME } from '../constants.js';
import { buildTavernView } from '../views/build-tavern-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const playerId = parseIntegerArg(args[1]);

  await interaction.deferUpdate();
  const player = await playerRepository.findByIdOrThrow(playerId);

  assertPlayerIsNotAtSea(player);

  await editReply(interaction, buildTavernView({ player, ownerDiscordId }));
}

export const tavernButtonHandler: ButtonHandler = {
  name: TAVERN_BUTTON_NAME,
  handle,
};
