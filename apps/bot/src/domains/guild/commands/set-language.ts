import { SUPPORTED_LANGUAGES } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildCancelButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { LANGUAGE_FLAGS } from '../constants.js';

export const setLanguageCommand: Command = {
  name: 'setlanguage',
  requiresSynchronization: false,
  async handler({ message }) {
    assertGuildMemberIsAdmin(message.member);

    const embed = buildOpEmbed('info').setTitle('Langue du serveur').setDescription('Dans quelle langue veux-tu que le bot te parle ?');
    const languageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buildCancelButton(message.author.id),
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
