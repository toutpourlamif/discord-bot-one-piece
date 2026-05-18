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
import { CONFIRM_SET_LANGUAGE_BUTTON_NAME, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../constants.js';
import { requireGuildId } from '../guards.js';
import * as guildService from '../service.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  assertGuildMemberIsAdmin(interaction.member);
  await interaction.deferUpdate();

  const language = parseStringArg(args[1], 'Langage introuvable.');
  const guildId = requireGuildId(interaction.guildId);
  const foundLanguage = SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
  if (!foundLanguage) {
    throw new ValidationError(`Ce langage n'est pas supporté.`);
  }
  await guildService.setGuildLanguage(guildId, language as SupportedLanguage);

  const embed = buildOpEmbed('success')
    .setTitle('Langue modifiée !')
    .setDescription(`Le langage du serveur est maintenant \`${language}\`.`);
  await interaction.editReply({ embeds: [embed], components: [] });
}

export const confirmSetLanguageButtonHandler: ButtonHandler = {
  name: CONFIRM_SET_LANGUAGE_BUTTON_NAME,
  handle,
};
