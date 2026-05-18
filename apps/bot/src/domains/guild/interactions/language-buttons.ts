import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from 'discord.js';

import type { ButtonHandler } from '../../../discord/types.js';
import {
  assertGuildMemberIsAdmin,
  assertInteractorIsTheOwner,
  buildCustomId,
  buildOpEmbed,
  parseOwnerDiscordId,
} from '../../../discord/utils/index.js';
import { CANCEL_SET_LANGUAGE_BUTTON_NAME, CONFIRM_SET_LANGUAGE_BUTTON_NAME, LANGUAGE_NAMES } from '../constants.js';

function createHandle(language: SupportedLanguage) {
  return async function handle(interaction: ButtonInteraction, args: Array<string>): Promise<void> {
    const ownerDiscordId = parseOwnerDiscordId(args[0]);
    assertInteractorIsTheOwner(interaction, ownerDiscordId);
    assertGuildMemberIsAdmin(interaction.member);
    await interaction.deferUpdate();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_LANGUAGE_BUTTON_NAME, interaction.user.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CONFIRM_SET_LANGUAGE_BUTTON_NAME, interaction.user.id, language))
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Success),
    );
    const embed = buildOpEmbed('info')
      .setTitle(`Mettre le serveur en ${LANGUAGE_NAMES[language]} ?`)
      .setFooter({ text: `⚠️ Ce changement s'appliquera à tout le serveur ${interaction.guild!.name}.` });
    await interaction.editReply({ embeds: [embed], components: [row] });
  };
}
export const languageButtonHandlers: Array<ButtonHandler> = SUPPORTED_LANGUAGES.map((language) => ({
  name: language,
  handle: createHandle(language),
}));
