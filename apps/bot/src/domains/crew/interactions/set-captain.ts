import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { buildOpEmbed } from '../../../discord/utils/build-op-embed.js';
import { editReply } from '../../../discord/utils/index.js';
import { parseIntegerArg } from '../../../discord/utils/parse-integer-arg.js';
import type { Character } from '../../character/types.js';
import { findOrCreatePlayer } from '../../player/service.js';
import { SET_CAPTAIN_BUTTON_NAME } from '../constants.js';
import * as crewRepository from '../repository.js';
import { getCrewByPlayerId, replaceCaptainOfPlayer } from '../service.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const targetInstanceId = parseIntegerArg(args[0]);

  const interactionUser = interaction.user;
  const { player } = await findOrCreatePlayer(interactionUser.id, interactionUser.username, interaction.guildId!);

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
    .setDescription(`**${selectedMember.name}** est maintenant le capitaine de ton équipage.`);
  await editReply(interaction, { embeds: [embed], components: [] });
}

function assertCharacterBelongsToPlayer(ownerPlayerId: number | undefined, playerId: number): void {
  if (ownerPlayerId === playerId) return;

  throw new ValidationError("Tu ne peux pas changer le capitaine de quelqu'un d'autre.");
}

function assertCharacterIsInCrew(member: Character | undefined): asserts member is Character {
  if (member) return;

  throw new ValidationError("Ce personnage n'est pas dans ton équipage.");
}

export const setCaptainButtonHandler: ButtonHandler = {
  name: SET_CAPTAIN_BUTTON_NAME,
  handle,
};
