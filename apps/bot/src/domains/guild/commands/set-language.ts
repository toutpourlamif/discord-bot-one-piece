import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { CUSTOM_ID_SEPARATOR } from '../../../discord/constants.js';
import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildOpEmbed, buildCustomId } from '../../../discord/utils/index.js';
import { CANCEL_SET_LANGUAGE_BUTTON_NAME, CONFIRM_SET_LANGUAGE_BUTTON_NAME } from '../constants.js';

const WHITESPACE_REGEX = /\s/;

export const setLanguageCommand: Command = {
  name: 'setlanguage',
  async handler({ message, args, guild }) {
    assertGuildMemberIsAdmin(message.member);

    const language = parseGuildLanguageArg(args);

    const embed = buildOpEmbed('warn')
      .setTitle('Changer la langue ?')
      .setDescription(`Es-tu sûr de vouloir changer la langue \`${guild.language}\` en \`${language}\` ?`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CONFIRM_SET_LANGUAGE_BUTTON_NAME, message.author.id, language))
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_LANGUAGE_BUTTON_NAME, message.author.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};

function parseGuildLanguageArg(args: Array<string>): string {
  if (args.length !== 1) {
    throw new ValidationError('Donne exactement un mot. Ex: !setlanguage fr');
  }

  const language = args[0]!;
  assertLanguageIsValid(language);
  return language;
}

function assertLanguageIsValid(language: string): void {
  if (language.length !== 2) {
    throw new ValidationError('Le langage doit faire 2 caractères.');
  }

  if (WHITESPACE_REGEX.test(language)) {
    throw new ValidationError("Le langage ne peut pas contenir d'espace.");
  }

  if (language.includes(CUSTOM_ID_SEPARATOR)) {
    throw new ValidationError(`Le langage ne peut pas contenir "${CUSTOM_ID_SEPARATOR}".`);
  }
}
