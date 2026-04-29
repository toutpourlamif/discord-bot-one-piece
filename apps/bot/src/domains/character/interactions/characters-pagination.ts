import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg, assertMenuOwner } from '../../../discord/utils/index.js';
import * as playerRepository from '../../player/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { buildCharactersView } from '../characters-view.js';
import { CHARACTERS_BUTTON_NAME } from '../constants.js';
import { getCharactersByPlayerId } from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = args[0];
  if (!ownerDiscordId) throw new ValidationError('Propriétaire du menu introuvable.');
  if (!(await assertMenuOwner(interaction, ownerDiscordId))) return;
  const playerId = parseIntegerArg(args[1]);
  const page = parseIntegerArg(args[2]);

  await interaction.deferUpdate();

  const player = await playerRepository.findByIdOrThrow(playerId);
  const ship = await shipRepository.findByPlayerIdOrThrow(player.id);

  const characters = await getCharactersByPlayerId(player.id);
  await interaction.editReply(buildCharactersView(player, ship, characters, page, ownerDiscordId));
}

export const charactersPaginationButtonHandler: ButtonHandler = {
  name: CHARACTERS_BUTTON_NAME,
  handle,
};
