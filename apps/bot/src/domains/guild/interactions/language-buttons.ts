import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import { ValidationError } from '../../../discord/errors.js';
import type { ButtonHandler } from '../../../discord/types.js';
import {
  assertGuildMemberIsAdmin,
  assertInteractorIsTheOwner,
  buildCancelButton,
  buildCustomId,
  buildOpEmbed,
  parseOwnerDiscordId,
  parseStringArg,
} from '../../../discord/utils/index.js';
import { CONFIRM_SET_LANGUAGE_BUTTON_NAME, LANGUAGE_NAMES, SELECT_LANGUAGE_BUTTON_NAME } from '../constants.js';
import { ServerOnlyError } from '../errors.js';
import { isSupportedLanguage } from '../guards.js';

async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
  const ownerDiscordId = parseOwnerDiscordId(args[0]);
  assertInteractorIsTheOwner(interaction, ownerDiscordId);
  assertGuildMemberIsAdmin(interaction.member);
  if (!interaction.inCachedGuild()) throw new ServerOnlyError();
  await interaction.deferUpdate();

  const rawLanguage = parseStringArg(args[1], 'Langage introuvable.');
  if (!isSupportedLanguage(rawLanguage)) {
    throw new ValidationError(`Ce langage n'est pas supporté.`);
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buildCancelButton(interaction.user.id),
    new ButtonBuilder()
      .setCustomId(buildCustomId(CONFIRM_SET_LANGUAGE_BUTTON_NAME, interaction.user.id, rawLanguage))
      .setLabel('Confirmer')
      .setStyle(ButtonStyle.Success),
  );
  const embed = buildOpEmbed('info')
    .setTitle(`Mettre le serveur en ${LANGUAGE_NAMES[rawLanguage]} ?`)
    .setFooter({ text: `⚠️ Ce changement s'appliquera à tout le serveur ${interaction.guild.name}.` });
  await interaction.editReply({ embeds: [embed], components: [row] });
}

export const selectLanguageButtonHandler: ButtonHandler = {
  name: SELECT_LANGUAGE_BUTTON_NAME,
  handle,
};
