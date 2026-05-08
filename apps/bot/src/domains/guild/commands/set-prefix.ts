import { MAX_GUILD_PREFIX_LENGTH } from '@one-piece/db';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

import { CUSTOM_ID_SEPARATOR } from '../../../discord/constants.js';
import { ValidationError } from '../../../discord/errors.js';
import type { Command } from '../../../discord/types.js';
import { assertHasAdministratorPermission, buildCustomId, buildOpEmbed } from '../../../discord/utils/index.js';
import { CANCEL_SET_PREFIX_BUTTON_NAME, CONFIRM_SET_PREFIX_BUTTON_NAME } from '../constants.js';

const WHITESPACE_REGEX = /\s/;

export const setPrefixCommand: Command = {
  name: 'setprefix',
  async handler({ message, args, guild }) {
    assertHasAdministratorPermission(message.member?.permissions);

    const prefix = requireGuildPrefixArg(args);

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

function requireGuildPrefixArg(args: Array<string>): string {
  if (args.length !== 1) {
    throw new ValidationError('Donne exactement un mot. Ex: !setprefix $');
  }

  const prefix = args[0]!;
  assertValidGuildPrefix(prefix);
  return prefix;
}

function assertValidGuildPrefix(prefix: string): void {
  if (prefix.length < 1 || prefix.length > MAX_GUILD_PREFIX_LENGTH) {
    throw new ValidationError('Le préfixe doit faire entre 1 et 8 caractères.');
  }

  if (WHITESPACE_REGEX.test(prefix)) {
    throw new ValidationError("Le préfixe ne peut pas contenir d'espace.");
  }

  if (prefix.includes(CUSTOM_ID_SEPARATOR)) {
    throw new ValidationError(`Le préfixe ne peut pas contenir "${CUSTOM_ID_SEPARATOR}".`);
  }
}
