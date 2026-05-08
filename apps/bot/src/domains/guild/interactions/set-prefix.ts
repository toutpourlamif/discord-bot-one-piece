import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import {
  assertHasAdministratorPermission,
  assertInteractorIsTheOwner,
  buildOpEmbed,
  parseOwnerDiscordId,
} from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME, CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';
import { requireGuildId } from '../guards.js';
import * as guildRepository from '../repository.js';

async function confirmSetPrefix(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  assertHasAdministratorPermission(interaction.memberPermissions);

  const prefix = requireGuildPrefix(args[1]);
  const guildId = requireGuildId(interaction.guildId);

  await interaction.deferUpdate();
  const updated = await guildRepository.updatePrefix(guildId, prefix);

  const embed = buildOpEmbed('success')
    .setTitle('Préfixe changé !')
    .setDescription(`Le préfixe du serveur est maintenant \`${updated.prefix}\`.`);
  await interaction.editReply({ embeds: [embed], components: [] });
}

async function cancelSetPrefix(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  await interaction.deferUpdate();
  await interaction.editReply({ content: 'Annulé.', embeds: [], components: [] });
}

export const confirmSetPrefixButtonHandler: ButtonHandler = {
  name: CONFIRM_SET_PREFIX_BUTTON_NAME,
  handle: confirmSetPrefix,
};

export const cancelSetPrefixButtonHandler: ButtonHandler = {
  name: CANCEL_SET_PREFIX_BUTTON_NAME,
  handle: cancelSetPrefix,
};

function requireGuildPrefix(prefix: string | undefined): string {
  if (!prefix) {
    throw new ValidationError('Préfixe introuvable.');
  }

  return prefix;
}
