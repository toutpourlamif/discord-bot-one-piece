import type { ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import {
  assertGuildMemberIsAdmin,
  assertInteractorIsTheOwner,
  buildOpEmbed,
  parseOwnerDiscordId,
  parseStringArg,
} from '../../../discord/utils/index.js';
import { CONFIRM_SET_LANGUAGE_BUTTON_NAME, LANGUAGE_NAMES } from '../constants.js';
import { isSupportedLanguage, requireGuildId } from '../guards.js';
import * as guildService from '../service.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  assertGuildMemberIsAdmin(interaction.member);
  await interaction.deferUpdate();

  const rawLanguage = parseStringArg(args[1], 'Langage introuvable.');
  if (!isSupportedLanguage(rawLanguage)) {
    throw new ValidationError(`Ce langage n'est pas supporté.`);
  }
  const guildId = requireGuildId(interaction.guildId);
  await guildService.setGuildLanguage(guildId, rawLanguage);

  const embed = buildOpEmbed('success')
    .setTitle('Langue mise à jour !')
    .setDescription(`Le serveur est désormais en ${LANGUAGE_NAMES[rawLanguage]}.`);
  await interaction.editReply({ embeds: [embed], components: [] });
}

export const confirmSetLanguageButtonHandler: ButtonHandler = {
  name: CONFIRM_SET_LANGUAGE_BUTTON_NAME,
  handle,
};
