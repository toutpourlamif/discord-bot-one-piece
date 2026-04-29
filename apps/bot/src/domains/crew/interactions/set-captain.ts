import type { ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import type { CharacterRow } from '../../character/types.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { SET_CAPTAIN_BUTTON_NAME } from '../constants.js';
import * as crewRepository from '../repository.js';
import { getCrewByPlayerId, replaceCaptainOfPlayer } from '../service.js';
import { buildSetCaptainView } from '../set-captain-view.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const targetInstanceId = parseIntegerArg(args[0]);

  await interaction.deferUpdate();

  const interactionUser = interaction.user;
  const { player } = await findOrCreatePlayer(interactionUser.id, interactionUser.username);

  const ownerPlayerId = await crewRepository.findOwnerPlayerIdByInstanceId(targetInstanceId);
  if (ownerPlayerId !== player.id) {
    await interaction.followUp({ content: "Tu ne peux pas changer le capitaine de quelqu'un d'autre.", ephemeral: true });
    return;
  }

  const crew = await getCrewByPlayerId(player.id);
  if (!(await assertMemberIsInCrew(interaction, crew, targetInstanceId))) return;

  await replaceCaptainOfPlayer(player.id, targetInstanceId);

  const updatedCrew = await getCrewByPlayerId(player.id);
  await interaction.editReply(buildSetCaptainView(player, updatedCrew));
}

async function assertMemberIsInCrew(interaction: ButtonInteraction, crew: Array<CharacterRow>, targetInstanceId: number): Promise<boolean> {
  if (crew.some((character) => character.instanceId === targetInstanceId)) return true;

  await interaction.followUp({ content: "Ce personnage n'est pas dans ton équipage.", ephemeral: true });
  return false;
}

export const setCaptainButtonHandler: ButtonHandler = {
  name: SET_CAPTAIN_BUTTON_NAME,
  handle,
};
