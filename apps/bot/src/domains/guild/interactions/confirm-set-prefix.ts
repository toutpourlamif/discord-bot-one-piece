import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, assertInteractorIsTheOwner, buildOpEmbed, parseOwnerDiscordId } from '../../../discord/utils/index.js';
import { CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';
import { requireGuildId } from '../guards.js';
import * as guildRepository from '../repository.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  assertGuildMemberIsAdmin(interaction.member);

  const prefix = requireGuildPrefix(args[1]);
  const guildId = requireGuildId(interaction.guildId);

  await interaction.deferUpdate();
  const updated = await guildRepository.updatePrefix(guildId, prefix);

  const embed = buildOpEmbed('success')
    .setTitle('Préfixe changé !')
    .setDescription(`Le préfixe du serveur est maintenant \`${updated.prefix}\`.`);
  await interaction.editReply({ embeds: [embed], components: [] });
}

function requireGuildPrefix(prefix: string | undefined): string {
  if (!prefix) {
    throw new ValidationError('Préfixe introuvable.');
  }

  return prefix;
}

export const confirmSetPrefixButtonHandler: ButtonHandler = {
  name: CONFIRM_SET_PREFIX_BUTTON_NAME,
  handle,
};
