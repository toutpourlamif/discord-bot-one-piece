import { SUPPORTED_LANGUAGES } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildOpEmbed, buildCustomId } from '../../../discord/utils/index.js';
import { CANCEL_SET_LANGUAGE_BUTTON_NAME, LANGUAGE_FLAGS } from '../constants.js';

export const setLanguageCommand: Command = {
  name: 'setlanguage',
  requiresSynchronization: false,
  async handler({ message }) {
    assertGuildMemberIsAdmin(message.member);

    const embed = buildOpEmbed('info').setTitle('Langue du serveur').setDescription('Dans quelle langue veux-tu que le bot te parle ?');
    const languageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_LANGUAGE_BUTTON_NAME, message.author.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
      ...SUPPORTED_LANGUAGES.map((language) =>
        new ButtonBuilder()
          .setCustomId(buildCustomId(language, message.author.id))
          .setLabel(LANGUAGE_FLAGS[language])
          .setStyle(ButtonStyle.Primary),
      ),
    );

    await message.reply({ embeds: [embed], components: [languageRow] });
  },
};
