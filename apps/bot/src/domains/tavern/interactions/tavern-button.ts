import { TAVERN_BY_ZONE, ZONE_LABELS } from '@one-piece/db';
import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, buildOpEmbed, parseIntegerArg, parseOwnerDiscordId } from '../../../discord/utils/index.js';
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

  const tavernConfig = TAVERN_BY_ZONE[player.currentZone];
  if (tavernConfig === undefined) {
    await interaction.editReply({
      embeds: [buildOpEmbed().setDescription(`Il n'y a malheureusement pas de taverne à ${ZONE_LABELS[player.currentZone]}.`)],
    });
    return;
  }

  await interaction.editReply(buildTavernView({ player, ownerDiscordId, tavernConfig }));
}

export const tavernButtonHandler: ButtonHandler = {
  name: TAVERN_BUTTON_NAME,
  handle,
};
