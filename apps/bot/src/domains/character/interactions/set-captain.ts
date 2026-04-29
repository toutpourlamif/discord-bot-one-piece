import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import * as crewRepository from '../../crew/repository.js';
import { buildSetCaptainView } from '../../crew/set-captain-view.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { SET_CAPTAIN_BUTTON_NAME } from '../constants.js';
import { getCrewByPlayerId } from '../service.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const targetInstanceId = parseIntegerArg(args[0]);

  await interaction.deferUpdate();

  const { player } = await findOrCreatePlayer(interaction.user.id, interaction.user.username);
  if (player.discordId !== interaction.user.id) {
    await interaction.followUp({ content: "Tu ne peux pas changer le capitaine de quelqu'un d'autre.", ephemeral: true });
    return;
  }

  const crew = await getCrewByPlayerId(player.id);

  if (!crew.some((character) => character.instanceId === targetInstanceId)) {
    await interaction.followUp({ content: "Ce character n'est pas dans ton équipage.", ephemeral: true });
    return;
  }

  await crewRepository.setCaptain(player.id, targetInstanceId);

  const updatedCrew = await getCrewByPlayerId(player.id);
  await interaction.editReply(buildSetCaptainView(player, updatedCrew));
}

export const setCaptainButtonHandler: ButtonHandler = {
  name: SET_CAPTAIN_BUTTON_NAME,
  handle,
};
