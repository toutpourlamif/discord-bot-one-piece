import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { SET_CAPTAIN_BUTTON_NAME } from '../constants.js';
import { getCharactersByPlayerId, setCaptain } from '../repository.js';
import { buildSetCaptainView } from '../set-captain-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const instanceId = parseIntegerArg(args[0]);

  await interaction.deferUpdate();

  const { player } = await findOrCreatePlayer(interaction.user.id, interaction.user.username);
  if (player.discordId !== interaction.user.id) {
    await interaction.followUp({ content: "Tu ne peux pas changer le capitaine de quelqu'un d'autre.", ephemeral: true });
    return;
  }

  const characters = await getCharactersByPlayerId(player.id);
  const crew = characters.filter((character) => character.joinedCrewAt !== null);

  if (!crew.some((character) => character.instanceId === instanceId)) {
    await interaction.followUp({ content: "Tu ne peux pas changer le capitaine de quelqu'un d'autre.", ephemeral: true });
    return;
  }

  await setCaptain(player.id, instanceId);

  const updatedCharacters = await getCharactersByPlayerId(player.id);
  const updatedCrew = updatedCharacters.filter((character) => character.joinedCrewAt !== null);
  await interaction.editReply(buildSetCaptainView(player, updatedCrew));
}

export const setCaptainButtonHandler: ButtonHandler = {
  name: SET_CAPTAIN_BUTTON_NAME,
  handle,
};
