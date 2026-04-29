import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg, assertMenuOwner } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { buildCharactersView } from '../characters-view.js';
import { CHARACTERS_BUTTON_NAME } from '../constants.js';
import { getCharactersByPlayerId } from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = parseIntegerArg(args[0]);
  const page = parseIntegerArg(args[1]);
  const player = await playerRepository.findByIdOrThrow(playerId);
  if (!(await assertMenuOwner(interaction, player.discordId))) return;

  await interaction.deferUpdate();

  const ship = await shipRepository.findByPlayerIdOrThrow(player.id);

  const characters = await getCharactersByPlayerId(player.id);
  await interaction.editReply(buildCharactersView(player, ship, characters, page));
}

export const charactersPaginationButtonHandler: ButtonHandler = {
  name: CHARACTERS_BUTTON_NAME,
  handle,
};
