import { SUPPORTED_LANGUAGES } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildCancelButton, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { LANGUAGE_FLAGS, SELECT_LANGUAGE_BUTTON_NAME } from '../constants.js';
import { texts } from '../texts.js';

export const setLanguageCommand: Command = {
  name: 'setlanguage',
  requiresSynchronization: false,
  requiresOnboardingFinished: false,
  async handler({ message, guild }) {
    assertGuildMemberIsAdmin(message.member);

    const embed = buildOpEmbed('info')
      .setTitle(texts.setLanguageTitle[guild.language])
      .setDescription(texts.setLanguageDescription[guild.language]);
    const languageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buildCancelButton(message.author.id),
      ...SUPPORTED_LANGUAGES.map((language) =>
        new ButtonBuilder()
          .setCustomId(buildCustomId(SELECT_LANGUAGE_BUTTON_NAME, message.author.id, language))
          .setLabel(LANGUAGE_FLAGS[language])
          .setStyle(ButtonStyle.Primary)
          .setDisabled(language === guild.language),
      ),
    );

    await message.reply({ embeds: [embed], components: [languageRow] });
  },
};
