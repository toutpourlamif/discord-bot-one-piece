import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import type { CharacterRow } from '../../character/types.js';
import { getCharacterInstanceName } from '../../character/utils/index.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { SET_CAPTAIN_BUTTON_NAME } from '../constants.js';
import * as crewRepository from '../repository.js';
import { getCrewByPlayerId, replaceCaptainOfPlayer } from '../service.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const targetInstanceId = parseIntegerArg(args[0]);

  const interactionUser = interaction.user;
  const { player } = await findOrCreatePlayer(interactionUser.id, interactionUser.username);

  const targetInstance = await crewRepository.findCharacterInstanceById(targetInstanceId);
  const ownerPlayerId = targetInstance?.playerId;
  assertCharacterBelongsToPlayer(ownerPlayerId, player.id);

  const crew = await getCrewByPlayerId(player.id);
  const selectedMember = crew.find((character) => character.instanceId === targetInstanceId);
  assertCharacterIsInCrew(selectedMember);

  await interaction.deferUpdate();
  await replaceCaptainOfPlayer(player.id, targetInstanceId);

  const embed = buildOpEmbed('success')
    .setTitle('Capitaine changé !')
    .setDescription(`**${getCharacterInstanceName(selectedMember)}** est maintenant le capitaine de ton équipage.`);
  await interaction.editReply({ embeds: [embed], components: [] });
}

function assertCharacterBelongsToPlayer(ownerPlayerId: number | undefined, playerId: number): void {
  if (ownerPlayerId === playerId) return;

  throw new ValidationError("Tu ne peux pas changer le capitaine de quelqu'un d'autre.");
}

function assertCharacterIsInCrew(member: CharacterRow | undefined): asserts member is CharacterRow {
  if (member) return;

  throw new ValidationError("Ce personnage n'est pas dans ton équipage.");
}

export const setCaptainButtonHandler: ButtonHandler = {
  name: SET_CAPTAIN_BUTTON_NAME,
  handle,
};
