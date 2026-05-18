import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildOpEmbed, buildCustomId } from '../../../discord/utils/index.js';
import { CANCEL_SET_LANGUAGE_BUTTON_NAME, EN_BUTTON_NAME, FR_BUTTON_NAME, LANGUAGE_FLAGS } from '../constants.js';

export const setLanguageCommand: Command = {
  name: 'setlanguage',
  async handler({ message, guild }) {
    assertGuildMemberIsAdmin(message.member);

    const embed = buildOpEmbed('warn').setTitle('Choisissez une langue');
    const languageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(FR_BUTTON_NAME, message.author.id))
        .setLabel(LANGUAGE_FLAGS.fr)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(EN_BUTTON_NAME, message.author.id))
        .setLabel(LANGUAGE_FLAGS.en)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_LANGUAGE_BUTTON_NAME, message.author.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
    );

    await message.reply({ embeds: [embed], components: [languageRow] });
  },
};
