import type { ButtonInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import { ForbiddenError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertInteractorIsTheOwner, buildOpEmbed, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME, CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';
import { requireGuildId } from '../guards.js';
import { decodeGuildPrefix, updatePrefix } from '../service.js';

async function confirmSetPrefix(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    throw new ForbiddenError('Cette commande est réservée aux admins du serveur.');
  }

  const prefix = decodeGuildPrefix(args[1]);
  const guildId = requireGuildId(interaction.guildId);

  await interaction.deferUpdate();
  const updated = await updatePrefix(guildId, prefix);

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
