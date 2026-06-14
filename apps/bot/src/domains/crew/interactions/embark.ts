import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, editReply, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import { findOrCreatePlayer } from '../../player/service.js';
import * as shipRepository from '../../ship/repository.js';
import { EMBARK_BUTTON_NAME } from '../constants.js';
import { embarkCharacter } from '../services/index.js';
import { buildBoardingView } from '../utils/build-boarding-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  const instanceId = parseIntegerArg(args[1]);
  const page = parseIntegerArg(args[2]);
  const interactionUser = interaction.user;

  await interaction.deferUpdate();

  const { player } = await findOrCreatePlayer(interactionUser.id, interactionUser.username, interaction.guildId!);
  await embarkCharacter(player.id, instanceId);
  const ship = await shipRepository.findByPlayerIdOrThrow(player.id);
  const characters = await getCharactersByPlayerId(player.id);

  await editReply(interaction, buildBoardingView(player, ship, characters, page, interaction.user.id));
}

export const embarkButtonHandler: ButtonHandler = {
  name: EMBARK_BUTTON_NAME,
  handle,
};
