import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { getCharactersByPlayerId } from '../../character/repository.js';
import * as playerRepository from '../../player/repository.js';
import * as shipRepository from '../../ship/repository.js';
import { CREW_BUTTON_NAME } from '../constants.js';
import { buildCrewView } from '../crew-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const playerId = parseIntegerArg(args[0]);
  const page = parseIntegerArg(args[1]);

  await interaction.deferUpdate();

  const player = await playerRepository.findByIdOrThrow(playerId);
  const ship = await shipRepository.findByPlayerIdOrThrow(player.id);

  const characters = await getCharactersByPlayerId(player.id);
  await interaction.editReply(buildCrewView(player, ship, characters, page));
}

export const crewPaginationButtonHandler: ButtonHandler = {
  name: CREW_BUTTON_NAME,
  handle,
};
