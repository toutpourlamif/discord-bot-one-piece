import { MAX_GUILD_PREFIX_LENGTH, MIN_GUILD_PREFIX_LENGTH } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { CUSTOM_ID_SEPARATOR } from '../../../discord/constants.js';
import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { assertGuildMemberIsAdmin, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME, CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';

const WHITESPACE_REGEX = /\s/;

export const setPrefixCommand: Command = {
  name: 'setprefix',
  async handler({ message, args, guild }) {
    assertGuildMemberIsAdmin(message.member);

    const prefix = parseGuildPrefixArg(args);

    const embed = buildOpEmbed('warn')
      .setTitle('Changer le préfixe ?')
      .setDescription(`Es-tu sûr de vouloir changer le préfixe de \`${guild.prefix}\` en \`${prefix}\` ?`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(buildCustomId(CONFIRM_SET_PREFIX_BUTTON_NAME, message.author.id, prefix))
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(buildCustomId(CANCEL_SET_PREFIX_BUTTON_NAME, message.author.id))
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary),
    );

    await message.reply({ embeds: [embed], components: [row] });
  },
};

function parseGuildPrefixArg(args: Array<string>): string {
  if (args.length !== 1) {
    throw new ValidationError('Donne exactement un mot. Ex: !setprefix $');
  }

  const prefix = args[0]!;
  assertPrefixIsValid(prefix);
  return prefix;
}

function assertPrefixIsValid(prefix: string): void {
  if (prefix.length < MIN_GUILD_PREFIX_LENGTH || prefix.length > MAX_GUILD_PREFIX_LENGTH) {
    throw new ValidationError(`Le préfixe doit faire entre ${MIN_GUILD_PREFIX_LENGTH} et ${MAX_GUILD_PREFIX_LENGTH} caractères.`);
  }

  if (WHITESPACE_REGEX.test(prefix)) {
    throw new ValidationError("Le préfixe ne peut pas contenir d'espace.");
  }

  if (prefix.includes(CUSTOM_ID_SEPARATOR)) {
    throw new ValidationError(`Le préfixe ne peut pas contenir "${CUSTOM_ID_SEPARATOR}".`);
  }
}
